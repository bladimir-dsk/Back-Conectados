import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCuartoDto } from './dto/create-cuarto.dto';
import { UpdateCuartoDto } from './dto/update-cuarto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuarto } from './entities/cuarto.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from 'src/common/enums/rol.enum';
import { TipoRenta } from 'src/common/enums/tipoRenta.enum';

@Injectable()
export class CuartosService {
  constructor(
    @InjectRepository(Cuarto)
    private readonly cuartoRepository: Repository<Cuarto>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Alojamiento)
    private readonly alojamientoRepository: Repository<Alojamiento>,
  ) {}
  async create(createCuartoDto: CreateCuartoDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: {
        id_empresa: user.id_empresa,
      },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const alojamiento = await this.alojamientoRepository.findOne({
      where: {
        id_alojamiento: createCuartoDto.id_alojamiento,
        empresa: {
          id_empresa: empresa.id_empresa,
        },
      },
    });

    if (!alojamiento) {
      throw new BadRequestException('Alojamiento no encontrado');
    }

    // 🚫 VALIDACIÓN CLAVE
    if (alojamiento.typeIncome === TipoRenta.ALOJAMIENTO_COMPLETO) {
      throw new BadRequestException(
        'No se pueden crear cuartos cuando el alojamiento es de renta completa',
      );
    }

    if (alojamiento.typeIncome !== TipoRenta.ESPACIO) {
      throw new BadRequestException(
        'Solo se pueden crear cuartos cuando el alojamiento es por espacio',
      );
    }

    // ✅ SOLO SI ES ESPACIO (u otros permitidos) SE CREA
    const cuarto = this.cuartoRepository.create({
      ...createCuartoDto,
      empresa,
      userEmail: user.email,
      alojamiento,
    });

    return this.cuartoRepository.save(cuarto);
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

    // 🔐 Si es PROPIETARIO, filtrar solo los cuartos de sus alojamientos
    if (user.role === Role.PROPIETARIO) {
      where.alojamiento = {
        propietario: {
          email: user.email, // ✅ Usar email en lugar de id_usuario
        },
      };
    }

    const [data, total] = await this.cuartoRepository.findAndCount({
      where,
      relations: ['alojamiento', 'alojamiento.propietario'], // ✅ Incluir propietario para validar
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
      id_cuarto: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    // 🔐 Si es PROPIETARIO, filtrar solo los cuartos de sus alojamientos
    if (user.role === Role.PROPIETARIO) {
      whereConditions.alojamiento = {
        propietario: {
          email: user.email, // ✅ Usar email en lugar de id
        },
      };
    }

    const cuarto = await this.cuartoRepository.findOne({
      where: whereConditions,
      relations: ['alojamiento', 'alojamiento.propietario'],
    });

    if (!cuarto) {
      throw new BadRequestException('Cuarto no encontrado');
    }

    return cuarto;
  }

  async update(
    id: number,
    updateCuartoDto: UpdateCuartoDto,
    user: UserActiveInterface,
  ) {
    const whereConditions: any = {
      id_cuarto: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.alojamiento = {
        propietario: {
          email: user.email,
        },
      };
    }

    const cuarto = await this.cuartoRepository.findOne({
      where: whereConditions,
      relations: ['alojamiento', 'alojamiento.propietario', 'empresa'],
    });

    if (!cuarto) {
      throw new BadRequestException(
        'Cuarto no encontrado o no tienes permisos',
      );
    }

    if (
      updateCuartoDto.id_alojamiento &&
      updateCuartoDto.id_alojamiento !== cuarto.alojamiento.id_alojamiento
    ) {
      const whereAlojamiento: any = {
        id_alojamiento: updateCuartoDto.id_alojamiento,
        empresa: {
          id_empresa: user.id_empresa,
        },
      };

      if (user.role === Role.PROPIETARIO) {
        whereAlojamiento.propietario = {
          email: user.email,
        };
      }

      const nuevoAlojamiento = await this.alojamientoRepository.findOne({
        where: whereAlojamiento,
        relations: ['propietario'],
      });

      if (!nuevoAlojamiento) {
        throw new BadRequestException(
          'Alojamiento no encontrado o no tienes permisos',
        );
      }

      cuarto.alojamiento = nuevoAlojamiento;
    }

    Object.assign(cuarto, {
      ...updateCuartoDto,
      userEmail: user.email,
    });

    return this.cuartoRepository.save(cuarto);
  }

  async remove(id: number, user: UserActiveInterface) {
    const whereConditions: any = {
      id_cuarto: id,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereConditions.alojamiento = {
        propietario: {
          email: user.email,
        },
      };
    }

    const cuarto = await this.cuartoRepository.findOne({
      where: whereConditions,
      relations: ['alojamiento', 'alojamiento.propietario'],
    });

    if (!cuarto) {
      throw new BadRequestException(
        'Cuarto no encontrado o no tienes permisos',
      );
    }

    await this.cuartoRepository.remove(cuarto);

    return {
      message: 'Cuarto eliminado exitosamente',
    };
  }

  async findByAlojamiento(
    alojamientoId: number,
    query: {
      page?: number;
      limit?: number;
    },
    user: UserActiveInterface,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const whereAlojamiento: any = {
      id_alojamiento: alojamientoId,
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    if (user.role === Role.PROPIETARIO) {
      whereAlojamiento.propietario = {
        email: user.email,
      };
    }

    const alojamiento = await this.alojamientoRepository.findOne({
      where: whereAlojamiento,
      relations: ['propietario'],
    });

    if (!alojamiento) {
      throw new BadRequestException(
        'Alojamiento no encontrado o no tienes permisos',
      );
    }

    const [data, total] = await this.cuartoRepository.findAndCount({
      where: {
        alojamiento: {
          id_alojamiento: alojamientoId,
        },
        empresa: {
          id_empresa: user.id_empresa,
        },
      },

      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      alojamiento,
      cuartos: data,
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
