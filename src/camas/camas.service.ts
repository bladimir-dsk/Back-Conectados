import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCamaDto } from './dto/create-cama.dto';
import { UpdateCamaDto } from './dto/update-cama.dto';
import { Cama } from './entities/cama.entity';
import { Repository } from 'typeorm';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from 'src/common/enums/rol.enum';

@Injectable()
export class CamasService {
  constructor(
    @InjectRepository(Cuarto)
    private readonly cuartoRepository: Repository<Cuarto>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Cama)
    private readonly camaRepository: Repository<Cama>,
  ) {}

  async create(createCamaDto: CreateCamaDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: {
        id_empresa: user.id_empresa,
      },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const whereCuarto: any = {
      id_cuarto: createCamaDto.id_cuarto,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereCuarto.alojamiento = {
        propietario: {
          email: user.email,
        },
      };
    }

    const cuarto = await this.cuartoRepository.findOne({
      where: whereCuarto,
      relations: ['alojamiento', 'alojamiento.propietario'],
    });

    if (!cuarto) {
      throw new BadRequestException(
        'Cuarto no encontrado o no tienes permisos',
      );
    }

    const cama = this.camaRepository.create({
      ...createCamaDto,
      empresa,
      cuarto,
      userEmail: user.email,
    });

    return this.camaRepository.save(cama);
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
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
      where.cuarto = {
        alojamiento: {
          propietario: {
            email: user.email,
          },
        },
      };
    }

    const [data, total] = await this.camaRepository.findAndCount({
      where,
      relations: [
        'cuarto',
        'cuarto.alojamiento',
        'cuarto.alojamiento.propietario',
      ],
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
    const whereConditions: any = {
      id_cama: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.cuarto = {
        alojamiento: {
          propietario: {
            email: user.email,
          },
        },
      };
    }

    const cama = await this.camaRepository.findOne({
      where: whereConditions,
      relations: [
        'cuarto',
        'cuarto.alojamiento',
        'cuarto.alojamiento.propietario',
      ],
    });

    if (!cama) {
      throw new BadRequestException('Cama no encontrada o no tienes permisos');
    }

    return cama;
  }

  async update(
    id: number,
    updateCamaDto: UpdateCamaDto,
    user: UserActiveInterface,
  ) {
    const whereConditions: any = {
      id_cama: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.cuarto = {
        alojamiento: {
          propietario: {
            email: user.email,
          },
        },
      };
    }

    const cama = await this.camaRepository.findOne({
      where: whereConditions,
      relations: [
        'cuarto',
        'cuarto.alojamiento',
        'cuarto.alojamiento.propietario',
        'empresa',
      ],
    });

    if (!cama) {
      throw new BadRequestException('Cama no encontrada o no tienes permisos');
    }

    if (
      updateCamaDto.id_cuarto &&
      updateCamaDto.id_cuarto !== cama.cuarto.id_cuarto
    ) {
      const whereCuarto: any = {
        id_cuarto: updateCamaDto.id_cuarto,
        empresa: {
          id_empresa: user.id_empresa,
        },
      };

      if (user.role === Role.PROPIETARIO) {
        whereCuarto.alojamiento = {
          propietario: {
            email: user.email,
          },
        };
      }

      const nuevoCuarto = await this.cuartoRepository.findOne({
        where: whereCuarto,
        relations: ['alojamiento', 'alojamiento.propietario'],
      });

      if (!nuevoCuarto) {
        throw new BadRequestException(
          'Cuarto no encontrado o no tienes permisos',
        );
      }

      cama.cuarto = nuevoCuarto;
    }

    Object.assign(cama, {
      ...updateCamaDto,
      userEmail: user.email,
    });

    return this.camaRepository.save(cama);
  }

  async remove(id: number, user: UserActiveInterface) {
    const whereConditions: any = {
      id_cama: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.cuarto = {
        alojamiento: {
          propietario: {
            email: user.email,
          },
        },
      };
    }

    const cama = await this.camaRepository.findOne({
      where: whereConditions,
      relations: [
        'cuarto',
        'cuarto.alojamiento',
        'cuarto.alojamiento.propietario',
      ],
    });

    if (!cama) {
      throw new BadRequestException('Cama no encontrada o no tienes permisos');
    }

    await this.camaRepository.remove(cama);

    return {
      message: 'Cama eliminada exitosamente',
    };
  }

  async findByCuarto(
    cuartoId: number,
    query: {
      page?: number;
      limit?: number;
    },
    user: UserActiveInterface,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const whereCuarto: any = {
      id_cuarto: cuartoId,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereCuarto.alojamiento = {
        propietario: {
          email: user.email,
        },
      };
    }

    const cuarto = await this.cuartoRepository.findOne({
      where: whereCuarto,
      // relations: ['alojamiento', 'alojamiento.propietario'],
    });

    if (!cuarto) {
      throw new BadRequestException(
        'Cuarto no encontrado o no tienes permisos',
      );
    }

    const [data, total] = await this.camaRepository.findAndCount({
      where: {
        cuarto: {
          id_cuarto: cuartoId,
        },
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
      relations: [
        // 'cuarto',
        // 'cuarto.alojamiento',
        // 'cuarto.alojamiento.propietario',
      ],
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      cuarto,
      camas: data,
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
}
