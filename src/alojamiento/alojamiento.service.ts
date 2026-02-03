import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateAlojamientoDto } from './dto/create-alojamiento.dto';
import { UpdateAlojamientoDto } from './dto/update-alojamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Alojamiento } from './entities/alojamiento.entity';
import { Repository } from 'typeorm';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { totalmem, userInfo } from 'node:os';
import { Role } from 'src/common/enums/rol.enum';
import { In } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AlojamientoService {
  constructor(
    @InjectRepository(Alojamiento)
    private readonly alojamientoRepository: Repository<Alojamiento>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(PlanVigencia)
    private readonly planVigenciaRepository: Repository<PlanVigencia>,
  ) {}

  async create(
    createAlojamientoDto: CreateAlojamientoDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: {
        id_empresa: user.id_empresa,
      },
    });
    if (!empresa) {
      throw new NotAcceptableException('Empresa no encontrada');
    }

    const planVigencia = await this.planVigenciaRepository.findOne({
      where: {
        id_PlanVigencia: createAlojamientoDto.id_PlanVigencia,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!planVigencia) {
      throw new NotAcceptableException('Plan vigencia no encontrado');
    }
    const servicios = await this.servicioRepository.findBy({
      id_servicio: In(createAlojamientoDto.id_servicio),
    });
    if (servicios.length !== createAlojamientoDto.id_servicio.length) {
      throw new NotAcceptableException('Servicio no encontrado');
    }

    const existingAlojamiento = await this.alojamientoRepository.findOne({
      where: {
        name: createAlojamientoDto.name,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (existingAlojamiento) {
      throw new NotAcceptableException('Alojamiento ya existe');
    }

    const alojamiento = this.alojamientoRepository.create({
      name: createAlojamientoDto.name,
      url: createAlojamientoDto.url,
      type: createAlojamientoDto.type,
      gender: createAlojamientoDto.gender,
      qualification: createAlojamientoDto.qualification,
      empresa,
      planVigencia,
      servicios,
      userEmail: user.email,
    });
    return this.alojamientoRepository.save(alojamiento);
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      type?: string;
      gender?: string;
    },
    user: UserActiveInterface,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const where: any = {
      userEmail: user.email,
    };
    if (query.type) {
      where.type = query.type;
    }
    if (query.gender) {
      where.gender = query.gender;
    }
    const [data, total] = await this.alojamientoRepository.findAndCount({
      where,
      relations: ['servicios', 'planVigencia'],
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        totalItems: total,
        ItemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findAllPropietario(
    query: {
      page?: number;
      limit?: number;
      type?: string;
      gender?: string;
    },
    user: UserActiveInterface,
  ) {
    if (user.role !== Role.PROPIETARIO) {
      throw new ForbiddenException('Acceso denegado');
    }
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const where: any = {
      userEmail: user.email,
    };
    if (query.type) {
      where.type = query.type;
    }
    if (query.gender) {
      where.gender = query.gender;
    }
    const [data, total] = await this.alojamientoRepository.findAndCount({
      where,
      relations: ['servicios', 'planVigencia'],
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        totalItems: total,
        ItemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: number, user: UserActiveInterface) {
    const alojamiento = await this.alojamientoRepository.findOne({
      where: {
        id_alojamiento: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }
    return alojamiento;
  }

  async update(
    id: number,
    updateAlojamientoDto: UpdateAlojamientoDto,
    user: UserActiveInterface,
  ) {
    const alojamiento = await this.alojamientoRepository.findOne({
      where: {
        id_alojamiento: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
      relations: ['servicios', 'planVigencia'],
    });
    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }

    // Actualizar los servicios del alojamiento
    if (updateAlojamientoDto.id_servicio) {
      const servicios = await this.servicioRepository.findBy({
        id_servicio: In(updateAlojamientoDto.id_servicio),
      });
      if (servicios.length !== updateAlojamientoDto.id_servicio.length) {
        throw new NotAcceptableException('Servicio no encontrado');
      }
      alojamiento.servicios = servicios;
    }

    // Actualizar el plan de vigencia del alojamiento
    if (updateAlojamientoDto.id_PlanVigencia) {
      const planVigencia = await this.planVigenciaRepository.findOne({
        where: {
          id_PlanVigencia: updateAlojamientoDto.id_PlanVigencia,
          empresa: {
            id_empresa: user.id_empresa,
          },
        },
      });
      if (!planVigencia) {
        throw new NotAcceptableException('Plan vigencia no encontrado');
      }
      alojamiento.planVigencia = planVigencia;
    }

    const { name, url, type, gender, qualification } = updateAlojamientoDto;
    Object.assign(alojamiento, { name, url, type, gender, qualification });
    return this.alojamientoRepository.save(alojamiento);
  }

  async remove(id: number, user: UserActiveInterface) {
    if ((user.role !== Role.ADMIN, user.role !== Role.PROPIETARIO)) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }
    const alojamiento = await this.findOne(id, user);
    return this.alojamientoRepository.remove(alojamiento);
  }
}
