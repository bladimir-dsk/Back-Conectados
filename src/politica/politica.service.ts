import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePoliticaDto } from './dto/create-politica.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Politica } from './entities/politica.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class PoliticaService {
  constructor(
    @InjectRepository(Politica)
    private politicaRepository: Repository<Politica>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}

  async create(
    createPoliticaDto: CreatePoliticaDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const existingPolitica = await this.politicaRepository.findOne({
      where: {
        title: createPoliticaDto.title,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (existingPolitica) {
      throw new BadRequestException('Politica ya existe');
    }
    const politica = this.politicaRepository.create({
      title: createPoliticaDto.title,
      description: createPoliticaDto.description,
      accept: createPoliticaDto.accept ?? false,
      empresa,
      userEmail: user.email,
    });
    return this.politicaRepository.save(politica);
  }

  async findAll() {
    return this.politicaRepository.find();
  }

  async findOne(id: number, user: UserActiveInterface) {
    const politica = await this.politicaRepository.findOne({
      where: { id_politica: id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!politica) {
      throw new BadRequestException('Politica no encontrada');
    }
    return politica;
  }

  async update(
    id: number,
    updatePoliticaDto: UpdatePoliticaDto,
    user: UserActiveInterface,
  ) {
    const politica = await this.politicaRepository.findOne({
      where: { id_politica: id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!politica) {
      throw new BadRequestException('Politica no encontrada');
    }
    Object.assign(politica, updatePoliticaDto);
    const updatedPolitica = await this.politicaRepository.save(politica);
    return {
      message: 'Politica actualizada correctamente',
      data: updatedPolitica,
    };
  }

  async remove(id: number, user: UserActiveInterface) {
    const politica = await this.politicaRepository.findOne({
      where: { id_politica: id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!politica) {
      throw new BadRequestException('Politica no encontrada');
    }
    await this.politicaRepository.remove(politica);
    return {
      message: 'Politica eliminada correctamente',
    };
  }
}
