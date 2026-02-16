import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { UpdateCalificacionDto } from './dto/update-calificacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Calificacion } from './entities/calificacion.entity';
import { Repository } from 'typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';

@Injectable()
export class CalificacionService {
  constructor(
    @InjectRepository(Calificacion)
    private calificacionRepository: Repository<Calificacion>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(Alojamiento)
    private alojamientoRepository: Repository<Alojamiento>,
  ) {}

  async create(
    createCalificacionDto: CreateCalificacionDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const alojamiento = await this.alojamientoRepository.findOne({
      where: { id_alojamiento: createCalificacionDto.id_alojamiento },
    });

    if (!alojamiento) {
      throw new BadRequestException('Alojamiento no encontrado');
    }

    const existingCalificacion = await this.calificacionRepository.findOne({
      where: {
        alojamiento: { id_alojamiento: alojamiento.id_alojamiento },
        userEmail: user.email,
      },
    });

    if (existingCalificacion) {
      throw new BadRequestException('Calificacion ya existente');
    }

    const calificacion = this.calificacionRepository.create({
      ...createCalificacionDto,
      alojamiento,
      empresa,
      userEmail: user.email,
    });
    return this.calificacionRepository.save(calificacion);
  }

  async estadistica(id_alojamiento: number, user: UserActiveInterface) {
    const alojamiento = await this.alojamientoRepository.findOne({
      where: { id_alojamiento },
    });

    if (!alojamiento) {
      throw new BadRequestException('Alojamiento no encontrado');
    }

    const votos = await this.calificacionRepository.find({
      where: {
        alojamiento: { id_alojamiento },
        empresa: { id_empresa: user.id_empresa },
      },
    });
    const totalVotos = votos.length;

    if (totalVotos === 0) {
      return { totalVotos, promedio: 0 };
    }

    const conteo = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let suma = 0;

    votos.forEach((voto) => {
      conteo[voto.puntuacion] += 1;
      suma += voto.puntuacion;
    });

    const promedio = Number((suma / totalVotos).toFixed(2));

    const porcentaje = {
      1: ((conteo[1] / totalVotos) * 100).toFixed(2),
      2: ((conteo[2] / totalVotos) * 100).toFixed(2),
      3: ((conteo[3] / totalVotos) * 100).toFixed(2),
      4: ((conteo[4] / totalVotos) * 100).toFixed(2),
      5: ((conteo[5] / totalVotos) * 100).toFixed(2),
    };

    return {
      totalVotos,
      promedio,
      conteo,
      porcentaje,
    };
  }

  async findAll(user: UserActiveInterface) {
    return this.calificacionRepository.find({
      where: { empresa: { id_empresa: user.id_empresa } },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const calificacion = await this.calificacionRepository.findOne({
      where: {
        id_calificacion: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!calificacion) {
      throw new BadRequestException('Calificacion no encontrada');
    }
    return calificacion;
  }

  async update(
    id: number,
    updateCalificacionDto: UpdateCalificacionDto,
    user: UserActiveInterface,
  ) {
    const calificacion = await this.calificacionRepository.findOne({
      where: {
        id_calificacion: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });

    if (!calificacion) {
      throw new BadRequestException('Calificacion no encontrada');
    }

    if (updateCalificacionDto.puntuacion !== undefined) {
      calificacion.puntuacion = updateCalificacionDto.puntuacion;
    }

    if (updateCalificacionDto.comentario !== undefined) {
      calificacion.comentario =
        updateCalificacionDto.comentario?.trim() || null;
    }

    await this.calificacionRepository.save(calificacion);

    return { message: 'Calificacion actualizada', calificacion };
  }

  async remove(id: number, user: UserActiveInterface) {
    const calificacion = await this.calificacionRepository.findOne({
      where: {
        id_calificacion: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!calificacion) {
      throw new BadRequestException('Calificacion no encontrada');
    }
    await this.calificacionRepository.remove(calificacion);

    return { message: 'Calificacion eliminada', calificacion };
  }
}
