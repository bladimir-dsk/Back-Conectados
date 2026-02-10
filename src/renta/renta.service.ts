import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRentaDto } from './dto/create-renta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Renta } from './entities/renta.entity';
import { LessThan, Repository } from 'typeorm';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Cama } from 'src/camas/entities/cama.entity';
import { EstadoRenta } from 'src/common/enums/estadoRenta.enum';
import { Pago } from 'src/pago/entities/pago.entity';
import { EstadoPago } from 'src/common/enums/estadoPago.enum';
import { TipoRenta } from 'src/common/enums/tipoRenta.enum';
import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';
import { Cron } from '@nestjs/schedule';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Injectable()
export class RentaService {
  constructor(
    @InjectRepository(Renta)
    private rentaRepository: Repository<Renta>,

    @InjectRepository(Alojamiento)
    private alojamientoRepository: Repository<Alojamiento>,

    @InjectRepository(Cuarto)
    private cuartoRepository: Repository<Cuarto>,

    @InjectRepository(Cama)
    private camaRepository: Repository<Cama>,

    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,

    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}

  async crearRenta(createRentaDto: CreateRentaDto, user: UserActiveInterface) {
    // 1. Validar empresa del usuario
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    // 2. Validar el tipo de renta y limpiar IDs no necesarios
    const rentaData = this.limpiarDatosRenta(createRentaDto);

    // 3. Validar disponibilidad y obtener precio
    const validacion = await this.validarDisponibilidadYPrecio(rentaData, user);

    if (!validacion.disponible) {
      throw new BadRequestException(validacion.mensaje);
    }

    // 4. Calcular fechas
    const fechaEntrada = new Date(rentaData.fecha_entrada);
    const fechaSalida = this.calcularFechaSalida(
      fechaEntrada,
      rentaData.meses_a_pagar,
    );

    // 5. Calcular monto total
    const precioMensual = validacion.precioMensual;
    const montoTotal = precioMensual * rentaData.meses_a_pagar;

    // 6. Crear renta en transacción
    const queryRunner =
      this.rentaRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la renta con solo los campos necesarios
      const renta = this.rentaRepository.create({
        tipo_renta: rentaData.tipo_renta,
        id_alojamiento: rentaData.id_alojamiento || null,
        id_cuarto: rentaData.id_cuarto || null,
        id_cama: rentaData.id_cama || null,
        id_usuario: rentaData.id_usuario,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        meses_pagados: rentaData.meses_a_pagar,
        precio_mensual: precioMensual,
        monto_total: montoTotal,
        estado: EstadoRenta.PENDIENTE,
        empresa: empresa,
        userEmail: user.email,
      });

      const rentaGuardada = await queryRunner.manager.save(renta);

      // Crear el pago
      const pago = this.pagoRepository.create({
        id_renta: rentaGuardada.id_renta,
        monto: montoTotal,
        estado: EstadoPago.PENDIENTE,
      });

      await queryRunner.manager.save(pago);

      await queryRunner.commitTransaction();

      return {
        renta: rentaGuardada,
        monto_a_pagar: montoTotal,
        precio_mensual: precioMensual,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al crear renta:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Limpia los datos de renta según el tipo
   * Elimina IDs que no corresponden al tipo de renta seleccionado
   */
  private limpiarDatosRenta(dto: CreateRentaDto): CreateRentaDto {
    const datosLimpios = { ...dto };

    switch (dto.tipo_renta) {
      case TipoRenta.ALOJAMIENTO_COMPLETO:
        // Solo debe tener id_alojamiento
        if (!datosLimpios.id_alojamiento) {
          throw new BadRequestException(
            'Debe proporcionar id_alojamiento para renta completa',
          );
        }
        delete datosLimpios.id_cuarto;
        delete datosLimpios.id_cama;
        break;

      case TipoRenta.CUARTO:
        // Solo debe tener id_cuarto
        if (!datosLimpios.id_cuarto) {
          throw new BadRequestException(
            'Debe proporcionar id_cuarto para renta de cuarto',
          );
        }
        delete datosLimpios.id_alojamiento;
        delete datosLimpios.id_cama;
        break;

      case TipoRenta.CAMA:
        // Solo debe tener id_cama
        if (!datosLimpios.id_cama) {
          throw new BadRequestException(
            'Debe proporcionar id_cama para renta de cama',
          );
        }
        delete datosLimpios.id_alojamiento;
        delete datosLimpios.id_cuarto;
        break;

      default:
        throw new BadRequestException('Tipo de renta no válido');
    }

    return datosLimpios;
  }

  async procesarPago(
    idRenta: number,
    datosPago: any,
    user: UserActiveInterface,
  ) {
    const queryRunner =
      this.rentaRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener renta con relaciones
      const renta = await this.rentaRepository.findOne({
        where: {
          id_renta: idRenta,
          empresa: { id_empresa: user.id_empresa },
        },
        relations: ['alojamiento', 'cuarto', 'cama', 'empresa'],
      });

      if (!renta) {
        throw new NotFoundException('Renta no encontrada');
      }

      // Actualizar estado del pago
      const pago = await this.pagoRepository.findOne({
        where: { id_renta: idRenta, estado: EstadoPago.PENDIENTE },
      });

      if (!pago) {
        throw new NotFoundException('Pago no encontrado');
      }

      pago.estado = EstadoPago.COMPLETADO;
      pago.metodo_pago = datosPago.metodo_pago;
      pago.transaccion_id = datosPago.transaccion_id;

      await queryRunner.manager.save(pago);

      // Actualizar estado de la renta
      renta.estado = EstadoRenta.ACTIVA;
      await queryRunner.manager.save(renta);

      // Actualizar estado del recurso rentado
      await this.actualizarEstadoRecurso(
        queryRunner,
        renta.tipo_renta,
        renta.id_alojamiento,
        renta.id_cuarto,
        renta.id_cama,
        EstadoAlojamiento.OCUPADO,
      );

      await queryRunner.commitTransaction();

      return { mensaje: 'Pago procesado exitosamente', renta };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validarDisponibilidadYPrecio(
    dto: CreateRentaDto,
    user: UserActiveInterface,
  ) {
    const fechaEntrada = new Date(dto.fecha_entrada);
    const fechaSalida = this.calcularFechaSalida(
      fechaEntrada,
      dto.meses_a_pagar,
    );

    switch (dto.tipo_renta) {
      case TipoRenta.ALOJAMIENTO_COMPLETO:
        return await this.validarAlojamientoCompleto(
          dto.id_alojamiento,
          fechaEntrada,
          fechaSalida,
          user,
        );

      case TipoRenta.CUARTO:
        return await this.validarCuarto(
          dto.id_cuarto,
          fechaEntrada,
          fechaSalida,
          user,
        );

      case TipoRenta.CAMA:
        return await this.validarCama(
          dto.id_cama,
          fechaEntrada,
          fechaSalida,
          user,
        );
    }
  }

  private async validarAlojamientoCompleto(
    idAlojamiento: number,
    fechaEntrada: Date,
    fechaSalida: Date,
    user: UserActiveInterface,
  ) {
    const alojamiento = await this.alojamientoRepository.findOne({
      where: {
        id_alojamiento: idAlojamiento,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (!alojamiento) {
      return { disponible: false, mensaje: 'Alojamiento no encontrado' };
    }

    // ✅ Validar que tenga precio configurado
    if (!alojamiento.precio_completo || alojamiento.precio_completo <= 0) {
      return {
        disponible: false,
        mensaje: 'El alojamiento no tiene precio configurado',
      };
    }

    if (alojamiento.estatus === EstadoAlojamiento.OCUPADO) {
      return { disponible: false, mensaje: 'Alojamiento no disponible' };
    }

    // Verificar que no haya rentas activas que se solapen
    const rentasActivas = await this.rentaRepository
      .createQueryBuilder('renta')
      .where('renta.id_alojamiento = :idAlojamiento', { idAlojamiento })
      .andWhere('renta.estado = :estado', { estado: EstadoRenta.ACTIVA })
      .andWhere(
        '(renta.fecha_entrada <= :fechaSalida AND renta.fecha_salida >= :fechaEntrada)',
        { fechaEntrada, fechaSalida },
      )
      .getCount();

    if (rentasActivas > 0) {
      return {
        disponible: false,
        mensaje: 'Alojamiento ocupado en esas fechas',
      };
    }

    return {
      disponible: true,
      precioMensual: Number(alojamiento.precio_completo), // ✅ Convertir a número
    };
  }

  private async validarCuarto(
    idCuarto: number,
    fechaEntrada: Date,
    fechaSalida: Date,
    user: UserActiveInterface,
  ) {
    const cuarto = await this.cuartoRepository.findOne({
      where: {
        id_cuarto: idCuarto,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (!cuarto) {
      return { disponible: false, mensaje: 'Cuarto no encontrado' };
    }

    // ✅ Validar que tenga precio configurado
    if (!cuarto.price || cuarto.price <= 0) {
      return {
        disponible: false,
        mensaje: 'El cuarto no tiene precio configurado',
      };
    }

    if (cuarto.estatus === EstadoAlojamiento.OCUPADO) {
      return { disponible: false, mensaje: 'Cuarto no disponible' };
    }

    const rentasActivas = await this.rentaRepository
      .createQueryBuilder('renta')
      .where('renta.id_cuarto = :idCuarto', { idCuarto })
      .andWhere('renta.estado = :estado', { estado: EstadoRenta.ACTIVA })
      .andWhere(
        '(renta.fecha_entrada <= :fechaSalida AND renta.fecha_salida >= :fechaEntrada)',
        { fechaEntrada, fechaSalida },
      )
      .getCount();

    if (rentasActivas > 0) {
      return { disponible: false, mensaje: 'Cuarto ocupado en esas fechas' };
    }

    return {
      disponible: true,
      precioMensual: Number(cuarto.price), // ✅ Convertir a número
    };
  }

  private async validarCama(
    idCama: number,
    fechaEntrada: Date,
    fechaSalida: Date,
    user: UserActiveInterface,
  ) {
    const cama = await this.camaRepository.findOne({
      where: {
        id_cama: idCama,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (!cama) {
      return { disponible: false, mensaje: 'Cama no encontrada' };
    }

    // ✅ Validar que tenga precio configurado
    if (!cama.price || cama.price <= 0) {
      return {
        disponible: false,
        mensaje: 'La cama no tiene precio configurado',
      };
    }

    if (cama.estatus === EstadoAlojamiento.OCUPADO) {
      return { disponible: false, mensaje: 'Cama no disponible' };
    }

    const rentasActivas = await this.rentaRepository
      .createQueryBuilder('renta')
      .where('renta.id_cama = :idCama', { idCama })
      .andWhere('renta.estado = :estado', { estado: EstadoRenta.ACTIVA })
      .andWhere(
        '(renta.fecha_entrada <= :fechaSalida AND renta.fecha_salida >= :fechaEntrada)',
        { fechaEntrada, fechaSalida },
      )
      .getCount();

    if (rentasActivas > 0) {
      return { disponible: false, mensaje: 'Cama ocupada en esas fechas' };
    }

    return {
      disponible: true,
      precioMensual: Number(cama.price), // ✅ Convertir a número
    };
  }

  private calcularFechaSalida(fechaEntrada: Date, meses: number): Date {
    const fechaSalida = new Date(fechaEntrada);
    fechaSalida.setMonth(fechaSalida.getMonth() + meses);
    // Restar 1 día para que si entra el día 1, salga el día 30/31
    fechaSalida.setDate(fechaSalida.getDate() - 1);
    return fechaSalida;
  }

  private async actualizarEstadoRecurso(
    queryRunner: any,
    tipoRenta: TipoRenta,
    idAlojamiento?: number,
    idCuarto?: number,
    idCama?: number,
    nuevoEstado?: EstadoAlojamiento,
  ) {
    switch (tipoRenta) {
      case TipoRenta.ALOJAMIENTO_COMPLETO:
        await queryRunner.manager.update(
          Alojamiento,
          { id_alojamiento: idAlojamiento },
          { estatus: nuevoEstado },
        );
        break;

      case TipoRenta.CUARTO:
        await queryRunner.manager.update(
          Cuarto,
          { id_cuarto: idCuarto },
          { estatus: nuevoEstado },
        );
        break;

      case TipoRenta.CAMA:
        await queryRunner.manager.update(
          Cama,
          { id_cama: idCama },
          { estatus: nuevoEstado },
        );
        break;
    }
  }

  // Tarea programada para liberar alojamientos cuando expire la renta
  @Cron('0 0 * * *') // Ejecutar diariamente a medianoche
  async verificarRentasExpiradas() {
    const hoy = new Date();

    const rentasExpiradas = await this.rentaRepository.find({
      where: {
        estado: EstadoRenta.ACTIVA,
        fecha_salida: LessThan(hoy),
      },
      relations: ['alojamiento', 'cuarto', 'cama'],
    });

    const queryRunner =
      this.rentaRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const renta of rentasExpiradas) {
        // Actualizar estado de la renta
        renta.estado = EstadoRenta.FINALIZADA;
        await queryRunner.manager.save(renta);

        // Liberar el recurso
        await this.actualizarEstadoRecurso(
          queryRunner,
          renta.tipo_renta,
          renta.id_alojamiento,
          renta.id_cuarto,
          renta.id_cama,
          EstadoAlojamiento.ACTIVO,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
