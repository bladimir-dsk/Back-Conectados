import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateAlojamientoDto } from './dto/create-alojamiento.dto';
import { UpdateAlojamientoDto } from './dto/update-alojamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Alojamiento } from './entities/alojamiento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AlojamientoService {
  constructor(
    @InjectRepository(Alojamiento)
    private readonly alojamientoRepository: Repository<Alojamiento>,
  ) {}

  async create(createAlojamientoDto: CreateAlojamientoDto) {
    const alojamiento = this.alojamientoRepository.create(createAlojamientoDto);
    return this.alojamientoRepository.save(alojamiento);
  }

  async findAll() {
    return this.alojamientoRepository.find();
  }

  async findOne(id: number) {
    const alojamiento = await this.alojamientoRepository.findOne({
      where: { id_alojamiento: id },
    });
    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }
    return alojamiento;
  }

  async update(id: number, updateAlojamientoDto: UpdateAlojamientoDto) {
    const alojamiento = await this.findOne(id);
    Object.assign(alojamiento, updateAlojamientoDto);
    return this.alojamientoRepository.save(alojamiento);
  }

  async remove(id: number) {
    const alojamiento = await this.findOne(id);
    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }
    return this.alojamientoRepository.remove(alojamiento);
  }
}
