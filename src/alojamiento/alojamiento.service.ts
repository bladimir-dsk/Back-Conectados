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
import { userInfo } from 'node:os';
import { Role } from 'src/common/enums/rol.enum';
import { In } from 'typeorm';
import { Propietario } from 'src/propietarios/entities/propietario.entity';

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
    @InjectRepository(Propietario)
    private readonly propietarioRepository: Repository<Propietario>,
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

    const propietario = await this.propietarioRepository.findOne({
      where: {
        id_propietario: createAlojamientoDto.id_Propietario,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!propietario) {
      throw new NotAcceptableException('Propietario no encontrado');
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
      ...createAlojamientoDto,
      empresa,
      planVigencia,
      propietario,
      userEmail: user.email,
    });
    return this.alojamientoRepository.save(alojamiento);
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      // type?: string;
      // gender?: string;
    },
    user: UserActiveInterface,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const where: any = {
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      where.propietario = {
        email: user.email,
      };
    }

    // if (query.type) {
    //   where.type = query.type;
    // }
    // if (query.gender) {
    //   where.gender = query.gender;
    // }

    const [data, total] = await this.alojamientoRepository.findAndCount({
      where,
      relations: ['servicios', 'planVigencia', 'propietario'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      page,
      data,
      total,
      limit,
    };
  }

  async findOne(id: number, user: UserActiveInterface) {
    const whereConditions: any = {
      id_alojamiento: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.propietario = {
        email: user.email,
      };
    }

    const alojamiento = await this.alojamientoRepository.findOne({
      where: whereConditions,
      relations: ['servicios', 'planVigencia', 'propietario'],
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
    const whereConditions: any = {
      id_alojamiento: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.propietario = {
        email: user.email,
      };
    }

    const alojamiento = await this.alojamientoRepository.findOne({
      where: whereConditions,
      relations: ['servicios', 'planVigencia', 'propietario'],
    });

    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }

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

    if (updateAlojamientoDto.id_Propietario) {
      if (user.role !== Role.ADMIN) {
        throw new NotAcceptableException(
          'No tienes permisos para cambiar el propietario del alojamiento',
        );
      }

      const propietario = await this.propietarioRepository.findOne({
        where: {
          id_propietario: updateAlojamientoDto.id_Propietario,
          empresa: {
            id_empresa: user.id_empresa,
          },
        },
      });
      if (!propietario) {
        throw new NotAcceptableException('Propietario no encontrado');
      }
      alojamiento.propietario = propietario;
    }

    const {
      name,
      url,
      typeProperty,
      gender,
      typeIncome,
      country,
      city,
      codePostal,
      address,
      latitude,
      longitude,
      description,
      estatus,
    } = updateAlojamientoDto;

    Object.assign(alojamiento, {
      name,
      url,
      typeProperty,
      gender,
      typeIncome,
      country,
      city,
      codePostal,
      address,
      latitude,
      longitude,
      description,
      estatus,
      userEmail: user.email,
    });

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
