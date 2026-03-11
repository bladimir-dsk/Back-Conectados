import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRentaDto } from './dto/create-renta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Renta } from './entities/renta.entity';
import { In, LessThan, Repository } from 'typeorm';
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
import { AlojamientoServicio } from 'src/alojamiento_servicios/entities/alojamiento_servicio.entity';
import { RentaServicio } from 'src/renta-servicio/entities/renta-servicio.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { UpdateEstadoRentaDto } from './dto/update-renta.dto';

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

    @InjectRepository(AlojamientoServicio)
    private alojamientoServicioRepository: Repository<AlojamientoServicio>,

    @InjectRepository(RentaServicio)
    private rentaServicioRepository: Repository<RentaServicio>,

    private readonly stripeService: StripeService,
  ) {}

  async crearRenta(createRentaDto: CreateRentaDto, user: UserActiveInterface) {
    // 1. Validar empresa
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    // 2. Limpiar datos según tipo
    const rentaData = this.limpiarDatosRenta(createRentaDto);

    // 3. Validar disponibilidad y precio base
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

    const precioMensual = validacion.precioMensual;
    const subtotalBase = precioMensual * rentaData.meses_a_pagar;

    // 🔥 5. Obtener SIEMPRE el id_alojamiento real
    let idAlojamientoFinal: number;

    if (rentaData.tipo_renta === TipoRenta.ALOJAMIENTO_COMPLETO) {
      idAlojamientoFinal = rentaData.id_alojamiento;
    }

    if (rentaData.tipo_renta === TipoRenta.CUARTO) {
      const cuarto = await this.cuartoRepository.findOne({
        where: { id_cuarto: rentaData.id_cuarto },
        relations: ['alojamiento'],
      });

      if (!cuarto) {
        throw new BadRequestException('Cuarto no encontrado');
      }

      idAlojamientoFinal = cuarto.alojamiento.id_alojamiento;
    }

    if (rentaData.tipo_renta === TipoRenta.CAMA) {
      const cama = await this.camaRepository.findOne({
        where: { id_cama: rentaData.id_cama },
        relations: ['cuarto', 'cuarto.alojamiento'],
      });

      if (!cama) {
        throw new BadRequestException('Cama no encontrada');
      }

      idAlojamientoFinal = cama.cuarto.alojamiento.id_alojamiento;
    }

    // 🔥 6. Calcular servicios (APLICA A TODOS LOS TIPOS)
    let totalServicios = 0;
    let serviciosEncontrados: AlojamientoServicio[] = [];

    if (createRentaDto.serviciosSeleccionados?.length) {
      serviciosEncontrados = await this.alojamientoServicioRepository
        .createQueryBuilder('als')
        .innerJoinAndSelect('als.servicio', 'servicio')
        .where('als.alojamiento_id = :idAlojamiento', {
          idAlojamiento: idAlojamientoFinal,
        })
        .andWhere('als.id IN (:...ids)', {
          ids: createRentaDto.serviciosSeleccionados,
        })
        .getMany();

      if (
        serviciosEncontrados.length !==
        createRentaDto.serviciosSeleccionados.length
      ) {
        throw new BadRequestException(
          'Uno o más servicios no pertenecen a este alojamiento',
        );
      }

      totalServicios = serviciosEncontrados.reduce((acc, s) => {
        return acc + Number(s.costo || 0);
      }, 0);
    }

    const montoTotal = subtotalBase + totalServicios;

    // 🔥 7. Transacción
    const queryRunner =
      this.rentaRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      // 🔥 Guardar servicios en renta_servicios
      for (const servicio of serviciosEncontrados) {
        const rentaServicio = this.rentaServicioRepository.create({
          id_renta: rentaGuardada.id_renta,
          id_servicio: servicio.servicio.id_servicio,
          precio: servicio.costo,
          userEmail: user.email,
          id_empresa: user.id_empresa,
        });

        await queryRunner.manager.save(rentaServicio);
      }

      const paymentIntent = await this.stripeService.crearPaymentIntent(
        montoTotal,
        'mxn',
        {
          id_renta: String(rentaGuardada.id_renta),
          id_empresa: String(user.id_empresa),
          userEmail: user.email,
        },
      );

      // Crear pago
      const pago = this.pagoRepository.create({
        id_renta: rentaGuardada.id_renta,
        monto: montoTotal,
        estado: EstadoPago.PENDIENTE,
        userEmail: user.email,
        empresa: { id_empresa: user.id_empresa },
        stripe_payment_intent_id: paymentIntent.id,
        // id_empresa: user.id_empresa,
      });

      await queryRunner.manager.save(pago);

      await queryRunner.commitTransaction();

      return {
        renta: rentaGuardada,
        monto_a_pagar: montoTotal,
        precio_mensual: precioMensual,
        total_servicios: totalServicios,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Llamado por el webhook cuando Stripe confirma el pago
  async activarRentaPorStripe(paymentIntent: any) {
    const pago = await this.pagoRepository.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado para este PaymentIntent');
    }

    // Evitar procesar dos veces
    if (pago.estado === EstadoPago.COMPLETADO) return;

    const queryRunner =
      this.rentaRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const renta = await queryRunner.manager
        .createQueryBuilder(Renta, 'renta')
        .setLock('pessimistic_write')
        .where('renta.id_renta = :id', { id: pago.id_renta })
        .getOne();

      if (!renta) throw new NotFoundException('Renta no encontrada');

      await this.validarDisponibilidadAntesDeActivar(renta);

      // Actualizar pago
      pago.estado = EstadoPago.COMPLETADO;
      pago.metodo_pago = 'stripe';
      pago.transaccion_id = paymentIntent.id;
      await queryRunner.manager.save(pago);

      // Activar renta
      renta.estado = EstadoRenta.ACTIVA;
      await queryRunner.manager.save(renta);

      await this.cancelarRentasPendientesDelMismoEspacio(queryRunner, renta);
      await this.actualizarEstadoRecursoCascada(
        queryRunner,
        renta.tipo_renta,
        renta.id_alojamiento,
        renta.id_cuarto,
        renta.id_cama,
        EstadoAlojamiento.OCUPADO,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async marcarPagoFallido(paymentIntent: any) {
    await this.pagoRepository.update(
      { stripe_payment_intent_id: paymentIntent.id },
      { estado: EstadoPago.FALLIDO },
    );
  }

  private limpiarDatosRenta(dto: CreateRentaDto): CreateRentaDto {
    const datosLimpios = { ...dto };

    switch (dto.tipo_renta) {
      case TipoRenta.ALOJAMIENTO_COMPLETO:
        if (!datosLimpios.id_alojamiento) {
          throw new BadRequestException(
            'Debe proporcionar id_alojamiento para renta completa',
          );
        }
        delete datosLimpios.id_cuarto;
        delete datosLimpios.id_cama;
        break;

      case TipoRenta.CUARTO:
        if (!datosLimpios.id_cuarto) {
          throw new BadRequestException(
            'Debe proporcionar id_cuarto para renta de cuarto',
          );
        }
        delete datosLimpios.id_alojamiento;
        delete datosLimpios.id_cama;
        break;

      case TipoRenta.CAMA:
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
      const renta = await queryRunner.manager
        .createQueryBuilder(Renta, 'renta')
        .setLock('pessimistic_write')
        .where('renta.id_renta = :idRenta', { idRenta })
        .getOne();

      if (!renta) {
        throw new NotFoundException('Renta no encontrada');
      }

      const pago = await this.pagoRepository.findOne({
        where: { id_renta: idRenta, estado: EstadoPago.PENDIENTE },
      });

      if (!pago) {
        throw new NotFoundException('Pago no encontrado');
      }

      await this.validarDisponibilidadAntesDeActivar(renta);

      pago.estado = EstadoPago.COMPLETADO;
      pago.metodo_pago = datosPago.metodo_pago;
      pago.transaccion_id = datosPago.transaccion_id;

      await queryRunner.manager.save(pago);

      renta.estado = EstadoRenta.ACTIVA;
      await queryRunner.manager.save(renta);

      await this.cancelarRentasPendientesDelMismoEspacio(queryRunner, renta);

      await this.actualizarEstadoRecursoCascada(
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

    if (!alojamiento.precio_completo || alojamiento.precio_completo <= 0) {
      return {
        disponible: false,
        mensaje: 'El alojamiento no tiene precio configurado',
      };
    }

    if (alojamiento.estatus === EstadoAlojamiento.OCUPADO) {
      return { disponible: false, mensaje: 'Alojamiento no disponible' };
    }

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
      precioMensual: Number(alojamiento.precio_completo),
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

    if (!cuarto.price || cuarto.price <= 0) {
      return {
        disponible: false,
        mensaje: 'El cuarto no tiene precio configurado',
      };
    }

    if (cuarto.estatus === EstadoAlojamiento.OCUPADO) {
      return { disponible: false, mensaje: 'Cuarto no disponible' };
    }
    // Validar que ninguna cama del cuarto esté ocupada (por estatus)
    const camasOcupadas = await this.camaRepository.count({
      where: {
        id_cuarto: idCuarto,
        estatus: EstadoAlojamiento.OCUPADO,
      },
    });

    if (camasOcupadas > 0) {
      return {
        disponible: false,
        mensaje: `No se puede rentar el cuarto completo porque ${camasOcupadas} cama(s) que le pertenecen ya están ocupadas`,
      };
    }

    // Validar que no haya rentas ACTIVAS en camas individuales de este cuarto en esas fechas
    const rentasCamasActivas = await this.rentaRepository
      .createQueryBuilder('renta')
      .innerJoin(Cama, 'cama', 'cama.id_cama = renta.id_cama')
      .where('cama.id_cuarto = :idCuarto', { idCuarto })
      .andWhere('renta.estado = :estado', { estado: EstadoRenta.ACTIVA })
      .andWhere(
        '(renta.fecha_entrada <= :fechaSalida AND renta.fecha_salida >= :fechaEntrada)',
        { fechaEntrada, fechaSalida },
      )
      .getCount();

    if (rentasCamasActivas > 0) {
      return {
        disponible: false,
        mensaje:
          'No se puede rentar el cuarto completo porque algunas de las camas que le pertenecen ya están ocupadas',
      };
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
      precioMensual: Number(cuarto.price),
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
      precioMensual: Number(cama.price),
    };
  }

  private calcularFechaSalida(fechaEntrada: Date, meses: number): Date {
    const fechaSalida = new Date(fechaEntrada);
    fechaSalida.setMonth(fechaSalida.getMonth() + meses);
    fechaSalida.setDate(fechaSalida.getDate() - 1);
    return fechaSalida;
  }

  private async actualizarEstadoRecursoCascada(
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

        await queryRunner.manager.update(
          Cuarto,
          { id_alojamiento: idAlojamiento },
          { estatus: nuevoEstado },
        );

        const cuartos = await queryRunner.manager.find(Cuarto, {
          where: { id_alojamiento: idAlojamiento },
          select: ['id_cuarto'],
        });

        if (cuartos.length > 0) {
          const idsCuartos = cuartos.map((c) => c.id_cuarto);
          await queryRunner.manager.update(
            Cama,
            { id_cuarto: In(idsCuartos) },
            { estatus: nuevoEstado },
          );
        }

        break;

      case TipoRenta.CUARTO:
        await queryRunner.manager.update(
          Cuarto,
          { id_cuarto: idCuarto },
          { estatus: nuevoEstado },
        );

        await queryRunner.manager.update(
          Cama,
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

  private async validarDisponibilidadAntesDeActivar(
    renta: Renta,
  ): Promise<void> {
    let conflicto = 0;

    switch (renta.tipo_renta) {
      case TipoRenta.ALOJAMIENTO_COMPLETO:
        conflicto = await this.rentaRepository.count({
          where: {
            id_alojamiento: renta.id_alojamiento,
            estado: EstadoRenta.ACTIVA,
          },
        });
        break;

      case TipoRenta.CUARTO:
        conflicto = await this.rentaRepository.count({
          where: {
            id_cuarto: renta.id_cuarto,
            estado: EstadoRenta.ACTIVA,
          },
        });
        break;

      case TipoRenta.CAMA:
        conflicto = await this.rentaRepository.count({
          where: {
            id_cama: renta.id_cama,
            estado: EstadoRenta.ACTIVA,
          },
        });
        break;
    }

    if (conflicto > 0) {
      throw new BadRequestException(
        'Este espacio ya fue ocupado por otro usuario',
      );
    }
  }

  private async cancelarRentasPendientesDelMismoEspacio(
    queryRunner: any,
    renta: Renta,
  ) {
    let whereCondition: any = {
      estado: EstadoRenta.PENDIENTE,
    };

    switch (renta.tipo_renta) {
      case TipoRenta.ALOJAMIENTO_COMPLETO:
        whereCondition.id_alojamiento = renta.id_alojamiento;
        break;

      case TipoRenta.CUARTO:
        whereCondition.id_cuarto = renta.id_cuarto;
        break;

      case TipoRenta.CAMA:
        whereCondition.id_cama = renta.id_cama;
        break;
    }

    // Excluir la renta actual
    const rentasPendientes = await queryRunner.manager.find(Renta, {
      where: whereCondition,
    });

    for (const rentaPendiente of rentasPendientes) {
      if (rentaPendiente.id_renta === renta.id_renta) continue;

      rentaPendiente.estado = EstadoRenta.CANCELADA;
      await queryRunner.manager.save(rentaPendiente);

      await queryRunner.manager.update(
        Pago,
        { id_renta: rentaPendiente.id_renta },
        { estado: EstadoPago.CANCELADO },
      );
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
        renta.estado = EstadoRenta.FINALIZADA;
        await queryRunner.manager.save(renta);
        await this.actualizarEstadoRecursoCascada(
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
      console.error('Error al verificar rentas expiradas:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findRentasUser(user: UserActiveInterface, estado?: EstadoRenta) {
    const rentas = await this.rentaRepository.find({
      where: {
        ...(estado ? { estado } : {}), // si no viene estado, trae todas
        empresa: { id_empresa: user.id_empresa },
        userEmail: user.email,
      },
      relations: [
        'alojamiento',
        'cuarto',
        'cuarto.alojamiento',
        'cama',
        'cama.cuarto',
        'cama.cuarto.alojamiento',
        'rentaServicios',
        'rentaServicios.servicio',
        'pagos',
      ],
    });

    return rentas.map((renta) => ({
      ...this.formatearRespuestaRenta(renta),
      id_pago: renta.pagos?.[0]?.id || null,
    }));
  }

  async findRentasPagosUser(user: UserActiveInterface, estado?: EstadoPago) {
    const pagos = await this.pagoRepository.find({
      where: {
        ...(estado ? { estado } : {}),
        empresa: { id_empresa: user.id_empresa },
        userEmail: user.email,
      },
      relations: [
        'renta',
        'renta.alojamiento',
        'renta.cuarto',
        'renta.cuarto.alojamiento',
        'renta.cama',
        'renta.cama.cuarto',
        'renta.cama.cuarto.alojamiento',
        'renta.rentaServicios',
        'renta.rentaServicios.servicio',
      ],
    });

    return pagos.map((pago) => ({
      id_pago: pago.id,
      monto: pago.monto,
      estado: pago.estado,
      metodo_pago: pago.metodo_pago ?? null,
      transaccion_id: pago.transaccion_id ?? null,
      renta: this.formatearRespuestaRenta(pago.renta),
      stripePaymentIntentId: pago.stripe_payment_intent_id ?? null,
    }));
  }

  async findRentasPagosUserIDpago(
    id_pago: number,
    user: UserActiveInterface,
    estado?: EstadoPago,
  ) {
    const pago = await this.pagoRepository.findOne({
      where: {
        ...(estado ? { estado } : {}),
        id: id_pago,
        empresa: { id_empresa: user.id_empresa },
        userEmail: user.email,
      },
      relations: [
        'renta',
        'renta.alojamiento',
        'renta.cuarto',
        'renta.cuarto.alojamiento',
        'renta.cama',
        'renta.cama.cuarto',
        'renta.cama.cuarto.alojamiento',
        'renta.rentaServicios',
        'renta.rentaServicios.servicio',
      ],
    });
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return {
      id_pago: pago.id,
      monto: pago.monto,
      estado: pago.estado,
      metodo_pago: pago.metodo_pago ?? null,
      transaccion_id: pago.transaccion_id ?? null,
      renta: this.formatearRespuestaRenta(pago.renta),
      stripePaymentIntentId: pago.stripe_payment_intent_id ?? null,
    };
  }

  private formatearRespuestaRenta(renta: Renta) {
    // Resolver ubicación según tipo de renta
    let ubicacion: any = null;

    switch (renta.tipo_renta) {
      case TipoRenta.ALOJAMIENTO_COMPLETO:
        ubicacion = {
          tipo: 'alojamiento_completo',
          alojamiento: {
            id_alojamiento: renta.alojamiento?.id_alojamiento,
            nombre: renta.alojamiento?.name,
            direccion: renta.alojamiento?.address,
            estatus: renta.alojamiento?.estatus,
          },
        };
        break;

      case TipoRenta.CUARTO:
        ubicacion = {
          tipo: 'cuarto',
          cuarto: {
            id_cuarto: renta.cuarto?.id_cuarto,
            nombre: renta.cuarto?.name,
            estatus: renta.cuarto?.estatus,
            precio: renta.cuarto?.price,
          },
          alojamiento: {
            id_alojamiento: renta.cuarto?.alojamiento?.id_alojamiento,
            nombre: renta.cuarto?.alojamiento?.name,
            direccion: renta.cuarto?.alojamiento?.address,
          },
        };
        break;

      case TipoRenta.CAMA:
        ubicacion = {
          tipo: 'cama',
          cama: {
            id_cama: renta.cama?.id_cama,
            nombre: renta.cama?.name,
            estatus: renta.cama?.estatus,
            precio: renta.cama?.price,
          },
          cuarto: {
            id_cuarto: renta.cama?.cuarto?.id_cuarto,
            nombre: renta.cama?.cuarto?.name,
            estatus: renta.cama?.cuarto?.estatus,
          },
          alojamiento: {
            id_alojamiento: renta.cama?.cuarto?.alojamiento?.id_alojamiento,
            nombre: renta.cama?.cuarto?.alojamiento?.name,
            direccion: renta.cama?.cuarto?.alojamiento?.address,
          },
        };
        break;
    }

    // Mapear servicios incluidos en la renta
    const servicios = (renta.rentaServicios ?? []).map((rs) => ({
      id_renta_servicio: rs.id_rentaServicio,
      id_servicio: rs.servicio?.id_servicio,
      nombre: rs.servicio?.name,
      precio: rs.precio,
    }));

    return {
      id_renta: renta.id_renta,
      tipo_renta: renta.tipo_renta,
      estado: renta.estado,
      fecha_entrada: renta.fecha_entrada,
      fecha_salida: renta.fecha_salida,
      meses_pagados: renta.meses_pagados,
      precio_mensual: renta.precio_mensual,
      monto_total: renta.monto_total,
      ubicacion,
      servicios,
      totales: {
        subtotal_alojamiento: renta.precio_mensual * renta.meses_pagados,
        total_servicios: servicios.reduce(
          (acc, s) => acc + Number(s.precio ?? 0),
          0,
        ),
        monto_total: renta.monto_total,
      },
    };
  }

  // renta.service.ts
  async iniciarPago(idRenta: number, user: UserActiveInterface) {
    const pago = await this.pagoRepository.findOne({
      where: { id_renta: idRenta, estado: EstadoPago.PENDIENTE },
    });

    if (!pago) throw new NotFoundException('Pago no encontrado');

    if (pago.stripe_payment_intent_id) {
      const pi = await this.stripeService.obtenerPaymentIntent(
        pago.stripe_payment_intent_id,
      );
      return { clientSecret: pi.client_secret };
    }

    const pi = await this.stripeService.crearPaymentIntent(
      Number(pago.monto),
      'mxn',
      { id_renta: String(idRenta), userEmail: user.email },
    );

    pago.stripe_payment_intent_id = pi.id;
    await this.pagoRepository.save(pago);

    return { clientSecret: pi.client_secret };
  }

  async actualizarEstadoRenta(
    updateEstadoRentaDto: UpdateEstadoRentaDto,
    user: UserActiveInterface,
  ) {
    const { id_renta, estado } = updateEstadoRentaDto;

    const renta = await this.rentaRepository.findOne({
      where: { id_renta },
      relations: ['pagos'],
    });

    if (!renta) {
      throw new NotFoundException('Renta no encontrada');
    }

    const queryRunner =
      this.rentaRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // actualizar estado renta
      renta.estado = estado;

      await queryRunner.manager.save(renta);

      // si se cancela la renta cancelar el pago
      if (estado === EstadoRenta.CANCELADA) {
        await queryRunner.manager.update(
          Pago,
          { renta: { id_renta: renta.id_renta } },
          { estado: EstadoPago.CANCELADO },
        );
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Estado actualizado correctamente',
        renta_id: renta.id_renta,
        estado_renta: renta.estado,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
