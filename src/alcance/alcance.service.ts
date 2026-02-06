import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAlcanceDto } from './dto/create-alcance.dto';
import { UpdateAlcanceDto } from './dto/update-alcance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Alcance } from './entities/alcance.entity';
import { Repository } from 'typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Injectable()
export class AlcanceService {
  constructor(
    @InjectRepository(Alcance)
    private readonly alcanceRepository: Repository<Alcance>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createAlcanceDto: CreateAlcanceDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const existingAlcance = await this.alcanceRepository.findOne({
      where: {
        title: createAlcanceDto.title,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (existingAlcance) {
      throw new BadRequestException('Alcance ya existe');
    }
    const alcance = this.alcanceRepository.create({
      ...createAlcanceDto,
      empresa,
      userEmail: user.email,
    });
    return this.alcanceRepository.save(alcance);
  }

  async findAll(user: UserActiveInterface) {
    return this.alcanceRepository.find({
      where: { empresa: { id_empresa: user.id_empresa } },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const alcance = await this.alcanceRepository.findOne({
      where: { id_alcance: id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!alcance) {
      throw new BadRequestException('Alcance not encontrado');
    }
    return alcance;
  }

  async update(
    id: number,
    updateAlcanceDto: UpdateAlcanceDto,
    user: UserActiveInterface,
  ) {
    const alcance = await this.alcanceRepository.findOne({
      where: { id_alcance: id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!alcance) {
      throw new BadRequestException('Alcance no encontrado');
    }
    Object.assign(alcance, updateAlcanceDto);
    const update = await this.alcanceRepository.save(alcance);
    return {
      message: 'Alcance actualizado correctamente',
      data: update,
    };
  }

  async remove(id: number, user: UserActiveInterface) {
    const alcance = await this.alcanceRepository.findOne({
      where: { id_alcance: id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!alcance) {
      throw new BadRequestException('Alcance no encontrado');
    }
    await this.alcanceRepository.remove(alcance);
    return {
      message: 'Alcance eliminado correctamente',
    };
  }
}
