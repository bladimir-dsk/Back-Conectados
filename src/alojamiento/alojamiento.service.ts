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
import { Role } from 'src/common/enums/rol.enum';
import { Propietario } from 'src/propietarios/entities/propietario.entity';
import { AlojamientoServicio } from 'src/alojamiento_servicios/entities/alojamiento_servicio.entity';
import { Calificacion } from 'src/calificacion/entities/calificacion.entity';

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
    @InjectRepository(AlojamientoServicio)
    private readonly alojamientoServicioRepository: Repository<AlojamientoServicio>,
    @InjectRepository(Calificacion)
    private readonly calificacionRepository: Repository<Calificacion>,
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

    // const planVigencia = await this.planVigenciaRepository.findOne({
    //   where: {
    //     id_PlanVigencia: createAlojamientoDto.id_PlanVigencia,
    //     empresa: {
    //       id_empresa: user.id_empresa,
    //     },
    //   },
    // });
    // if (!planVigencia) {
    //   throw new NotAcceptableException('Plan vigencia no encontrado');
    // }

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
      // planVigencia,
      propietario,
      userEmail: user.email,
    });
    return this.alojamientoRepository.save(alojamiento);
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      name?: string;
      priceMin?: number;
      priceMax?: number;
      typeProperty?: string;
      gender?: string;
      typeIncome?: string;
      city?: string;
      estatus?: string;
    },
    user: UserActiveInterface,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.alojamientoRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.servicios', 'servicios')
      .leftJoinAndSelect('a.propietario', 'propietario')
      .leftJoinAndSelect('a.fotos', 'fotos') // visualizar los datos de la tabla foto
      .where('a.empresa.id_empresa = :empresaId', {
        empresaId: user.id_empresa,
      });

    if (user.role === Role.PROPIETARIO) {
      qb.andWhere('propietario.email = :email', {
        email: user.email,
      });
    }

    if (query.name) {
      qb.andWhere('LOWER(a.name) LIKE LOWER(:name)', {
        name: `%${query.name}%`,
      });
    }
    if (query.priceMin !== undefined) {
      qb.andWhere('a.precio_completo >= :priceMin', {
        priceMin: query.priceMin,
      });
    }

    if (query.priceMax !== undefined) {
      qb.andWhere('a.precio_completo <= :priceMax', {
        priceMax: query.priceMax,
      });
    }

    if (query.typeProperty) {
      qb.andWhere('a.typeProperty = :typeProperty', {
        typeProperty: query.typeProperty,
      });
    }

    if (query.gender) {
      qb.andWhere('a.gender = :gender', {
        gender: query.gender,
      });
    }

    if (query.typeIncome) {
      qb.andWhere('a.typeIncome = :typeIncome', {
        typeIncome: query.typeIncome,
      });
    }

    if (query.city) {
      qb.andWhere('LOWER(a.city) LIKE LOWER(:city)', {
        city: `%${query.city}%`,
      });
    }

    if (query.estatus) {
      qb.andWhere('a.estatus = :estatus', {
        estatus: query.estatus,
      });
    }

    qb.take(limit).skip((page - 1) * limit);

    qb.orderBy('a.id_alojamiento', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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
      relations: [
        'servicios',
        'propietario',
        'fotos',
        'servicios.servicio',
        'calificacion',
      ],
    });

    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }

    return {
      ...alojamiento,
      calificacion:
        alojamiento.calificacion.length > 0
          ? alojamiento.calificacion.reduce(
              (acc, cal) => acc + cal.puntuacion,
              0,
            ) / alojamiento.calificacion.length
          : 0,
    };
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
      relations: ['servicios', 'propietario', 'servicios.servicio', 'fotos'],
    });

    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }

    // if (updateAlojamientoDto.id_PlanVigencia) {
    //   const planVigencia = await this.planVigenciaRepository.findOne({
    //     where: {
    //       id_PlanVigencia: updateAlojamientoDto.id_PlanVigencia,
    //       empresa: {
    //         id_empresa: user.id_empresa,
    //       },
    //     },
    //   });
    //   if (!planVigencia) {
    //     throw new NotAcceptableException('Plan vigencia no encontrado');
    //   }
    //   alojamiento.planVigencia = planVigencia;
    // }

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
    return this.alojamientoRepository.remove(alojamiento);
  }

  // En alojamiento.service.ts

  async findOneWithDetails(id: number, user: UserActiveInterface) {
    const whereConditions: any = {
      id_alojamiento: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    // 🔐 Si es PROPIETARIO, filtrar solo sus alojamientos
    if (user.role === Role.PROPIETARIO) {
      whereConditions.propietario = {
        email: user.email,
      };
    }

    const alojamiento = await this.alojamientoRepository.findOne({
      where: whereConditions,
      relations: [
        'propietario',
        'servicios',
        'servicios.servicio',
        'cuartos', // ✅ Relación con cuartos
        'cuartos.camas', // ✅ Relación anidada: cuartos -> camas
        'fotos', // ✅ Relación con fotos
        'calificacion',
      ],
    });

    if (!alojamiento) {
      throw new NotAcceptableException(
        'Alojamiento no encontrado o no tienes permisos',
      );
    }

    return {
      ...alojamiento,
      calificacion:
        alojamiento.calificacion.length > 0
          ? alojamiento.calificacion.reduce(
              (acc, cal) => acc + cal.puntuacion,
              0,
            ) / alojamiento.calificacion.length
          : 0,
    };
  }

  async findWithDetails(
    query: {
      page?: number;
      limit?: number;
    },
    user: UserActiveInterface,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const whereConditions: any = {
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.propietario = {
        email: user.email,
      };
    }

    const [data, total] = await this.alojamientoRepository.findAndCount({
      where: whereConditions,
      relations: [
        'propietario',
        'servicios',
        'servicios.servicio',
        'cuartos',
        'cuartos.camas',
        'fotos', // ✅ Relación con fotos
        'calificacion',
      ],
      take: limit,
      skip: (page - 1) * limit,
      order: {
        id_alojamiento: 'DESC', // ✅ Ordenar por más reciente
        cuartos: {
          id_cuarto: 'ASC', // ✅ Ordenar cuartos
          camas: {
            id_cama: 'ASC', // ✅ Ordenar camas
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((alojamiento) => ({
        ...alojamiento,
        calificacion:
          alojamiento.calificacion.length > 0
            ? alojamiento.calificacion.reduce(
                (acc, cal) => acc + cal.puntuacion,
                0,
              ) / alojamiento.calificacion.length
            : 0,
      })),
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  ///traer sus alojamientos de un propietario
  async findAllPropietario(
    query: {
      page?: number;
      limit?: number;
      name?: string;
      priceMin?: number;
      priceMax?: number;
      typeProperty?: string;
      gender?: string;
      typeIncome?: string;
      city?: string;
    },
    user: UserActiveInterface,
    id_propietario: number,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const propietario = await this.propietarioRepository.findOne({
      where: {
        id_propietario,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });

    if (!propietario) {
      throw new NotAcceptableException('Propietario no encontrado');
    }

    const qb = this.alojamientoRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.servicios', 'servicios')
      .leftJoinAndSelect('a.propietario', 'propietario')
      .where('a.empresa.id_empresa = :empresaId', {
        empresaId: user.id_empresa,
      })
      .andWhere('propietario.id_propietario = :id', {
        id: id_propietario,
      });

    if (user.role === Role.PROPIETARIO) {
      qb.andWhere('propietario.email = :email', {
        email: user.email,
      });
    }

    if (query.name) {
      qb.andWhere('LOWER(a.name) LIKE LOWER(:name)', {
        name: `%${query.name}%`,
      });
    }

    if (query.priceMin !== undefined) {
      qb.andWhere('a.precio_completo >= :priceMin', {
        priceMin: query.priceMin,
      });
    }

    if (query.priceMax !== undefined) {
      qb.andWhere('a.precio_completo <= :priceMax', {
        priceMax: query.priceMax,
      });
    }

    if (query.typeProperty) {
      qb.andWhere('a.typeProperty = :typeProperty', {
        typeProperty: query.typeProperty,
      });
    }

    if (query.gender) {
      qb.andWhere('a.gender = :gender', {
        gender: query.gender,
      });
    }

    if (query.typeIncome) {
      qb.andWhere('a.typeIncome = :typeIncome', {
        typeIncome: query.typeIncome,
      });
    }

    if (query.city) {
      qb.andWhere('LOWER(a.city) LIKE LOWER(:city)', {
        city: `%${query.city}%`,
      });
    }

    qb.take(limit).skip((page - 1) * limit);
    qb.orderBy('a.id_alojamiento', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
