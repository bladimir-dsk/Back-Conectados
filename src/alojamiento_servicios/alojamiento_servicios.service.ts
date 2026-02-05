import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateManyAlojamientoServicioDto } from './dto/create-alojamiento_servicio.dto';
import { SyncAlojamientoServiciosDto } from './dto/update-alojamiento_servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AlojamientoServicio } from './entities/alojamiento_servicio.entity';
import { In, Repository } from 'typeorm';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from 'src/common/enums/rol.enum';

@Injectable()
export class AlojamientoServiciosService {
  constructor(
    @InjectRepository(AlojamientoServicio)
    private readonly alojamientoServicioRepository: Repository<AlojamientoServicio>,
    @InjectRepository(Alojamiento)
    private readonly alojamientoRepository: Repository<Alojamiento>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async createMany(
    dto: CreateManyAlojamientoServicioDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) throw new BadRequestException('Empresa no encontrada');

    const alojamiento = await this.alojamientoRepository.findOne({
      where: { id_alojamiento: dto.alojamiento_id },
    });
    if (!alojamiento)
      throw new BadRequestException('Alojamiento no encontrado');

    const servicios = await this.servicioRepository.findBy({
      id_servicio: In(dto.servicios.map((s) => s.servicio_id)),
    });

    if (servicios.length !== dto.servicios.length) {
      throw new BadRequestException('Uno o más servicios no existen');
    }

    const existentes = await this.alojamientoServicioRepository.find({
      where: {
        alojamiento: { id_alojamiento: dto.alojamiento_id },
        servicio: { id_servicio: In(dto.servicios.map((s) => s.servicio_id)) },
      },
    });

    if (existentes.length > 0) {
      throw new BadRequestException('Algunos servicios ya están asignados');
    }

    const entities = dto.servicios.map((item) => {
      const servicio = servicios.find(
        (s) => s.id_servicio === item.servicio_id,
      );

      return this.alojamientoServicioRepository.create({
        costo: item.costo ?? null,
        empresa,
        alojamiento,
        servicio,
        userEmail: user.email,
      });
    });

    return this.alojamientoServicioRepository.save(entities);
  }

  async findAllByAlojamiento(alojamientoId: number, user: UserActiveInterface) {
    const qb = this.alojamientoServicioRepository
      .createQueryBuilder('aloj_serv')
      .innerJoinAndSelect('aloj_serv.alojamiento', 'a')
      .innerJoinAndSelect('a.propietario', 'p')
      .innerJoinAndSelect('aloj_serv.servicio', 's')
      .where('a.id_alojamiento = :alojamientoId', { alojamientoId })
      .andWhere('aloj_serv.id_empresa = :empresaId', {
        empresaId: user.id_empresa,
      });

    if (user.role === Role.PROPIETARIO) {
      qb.andWhere('p.email = :email', {
        email: user.email,
      });
    }

    const rows = await qb.getMany();

    if (!rows.length) {
      if (user.role === Role.PROPIETARIO) {
        throw new ForbiddenException('No tienes acceso a este alojamiento');
      }

      return {
        alojamiento: null,
        servicios: [],
      };
    }

    const { alojamiento } = rows[0];

    const servicios = rows.map((r) => ({
      id: r.servicio.id_servicio,
      nombre: r.servicio.name,
      icono: r.servicio.icon,
      costo: r.costo,
    }));

    return {
      alojamiento,
      servicios,
    };
  }

  async syncServicios(
    alojamientoId: number,
    dto: SyncAlojamientoServiciosDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) throw new BadRequestException('Empresa no encontrada');

    const alojamiento = await this.alojamientoRepository.findOne({
      where: { id_alojamiento: alojamientoId },
    });
    if (!alojamiento) {
      throw new BadRequestException('Alojamiento no encontrado');
    }

    const actuales = await this.alojamientoServicioRepository.find({
      where: {
        alojamiento: { id_alojamiento: alojamientoId },
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['servicio'],
    });

    const actualesMap = new Map(
      actuales.map((a) => [a.servicio.id_servicio, a]),
    );

    const enviadosIds = dto.servicios.map((s) => s.servicio_id);

    const aEliminar = actuales.filter(
      (a) => !enviadosIds.includes(a.servicio.id_servicio),
    );
    const aGuardar: AlojamientoServicio[] = [];

    for (const item of dto.servicios) {
      const existente = actualesMap.get(item.servicio_id);

      if (existente) {
        existente.costo = item.costo;
        existente.userEmail = user.email;
        aGuardar.push(existente);
      } else {
        const servicio = await this.servicioRepository.findOne({
          where: { id_servicio: item.servicio_id },
        });

        if (!servicio) {
          throw new BadRequestException(
            `Servicio ${item.servicio_id} no existe`,
          );
        }

        aGuardar.push(
          this.alojamientoServicioRepository.create({
            alojamiento,
            servicio,
            empresa,
            costo: item.costo ?? null,
            userEmail: user.email,
          }),
        );
      }
    }
    return this.alojamientoServicioRepository.manager.transaction(
      async (manager) => {
        if (aEliminar.length) {
          await manager.remove(AlojamientoServicio, aEliminar);
        }

        return manager.save(AlojamientoServicio, aGuardar);
      },
    );
  }

  async remove(id: number, user: UserActiveInterface) {
    const alojamientoServicio =
      await this.alojamientoServicioRepository.findOne({
        where: {
          id,
          empresa: { id_empresa: user.id_empresa },
        },
      });

    if (!alojamientoServicio) {
      throw new BadRequestException('Servicio no encontrado');
    }

    await this.alojamientoServicioRepository.remove(alojamientoServicio);

    return {
      message: 'Servicio eliminado del alojamiento',
    };
  }
}
