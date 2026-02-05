import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { isMACAddress } from 'class-validator';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(
    createServicioDto: CreateServicioDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: {
        id_empresa: user.id_empresa,
      },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const existingServicio = await this.servicioRepository.findOne({
      where: {
        name: createServicioDto.name,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });

    if (existingServicio) {
      throw new BadRequestException('Servicio ya existe');
    }

    const servicio = this.servicioRepository.create({
      ...createServicioDto,
      empresa,
      userEmail: user.email,
    });

    return this.servicioRepository.save(servicio);
  }

  async findAll(user: UserActiveInterface) {
    return this.servicioRepository.find({
      where: {
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const servicio = await this.servicioRepository.findOne({
      where: {
        id_servicio: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!servicio) {
      throw new BadRequestException('Servicio no encontrado');
    }
    return servicio;
  }

  async update(
    id: number,
    updateServicioDto: UpdateServicioDto,
    user: UserActiveInterface,
  ) {
    const servicio = await this.servicioRepository.findOne({
      where: {
        id_servicio: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!servicio) {
      throw new BadRequestException('Servicio no encontrado');
    }
    return this.servicioRepository.update(id, updateServicioDto);
  }

  async remove(id: number, user: UserActiveInterface) {
    const servicio = await this.servicioRepository.findOne({
      where: {
        id_servicio: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!servicio) {
      throw new BadRequestException('Servicio no encontrado');
    }
    return this.servicioRepository.remove(servicio);
  }
}
