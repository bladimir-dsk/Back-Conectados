import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTerminosCondicioneDto } from './dto/create-terminos-condicione.dto';
import { UpdateTerminosCondicioneDto } from './dto/update-terminos-condicione.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TerminosCondicione } from './entities/terminos-condicione.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Empresa } from 'src/empresa/entities/empresa.entity';
@Injectable()
export class TerminosCondicionesService {
  constructor(
    @InjectRepository(TerminosCondicione)
    private readonly terminosCondicioneRepository: Repository<TerminosCondicione>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(
    createTerminosCondicioneDto: CreateTerminosCondicioneDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const existingTerminosCondicione =
      await this.terminosCondicioneRepository.findOne({
        where: {
          title: createTerminosCondicioneDto.title,
          empresa: { id_empresa: user.id_empresa },
        },
      });
    if (existingTerminosCondicione) {
      throw new BadRequestException('Terminos y condiciones ya existen');
    }
    const terminosCondicione = this.terminosCondicioneRepository.create({
      title: createTerminosCondicioneDto.title,
      description: createTerminosCondicioneDto.description,
      accept: createTerminosCondicioneDto.accept ?? false,
      empresa,
      userEmail: user.email,
    });
    return this.terminosCondicioneRepository.save(terminosCondicione);
  }

  async findAll(user: UserActiveInterface) {
    return this.terminosCondicioneRepository.find({
      where: { empresa: { id_empresa: user.id_empresa } },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const terminosCondicione = await this.terminosCondicioneRepository.findOne({
      where: { id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!terminosCondicione) {
      throw new BadRequestException('Terminos y condiciones no encontrados');
    }
    return terminosCondicione;
  }

  async update(
    id: number,
    updateTerminosCondicioneDto: UpdateTerminosCondicioneDto,
    user: UserActiveInterface,
  ) {
    const terminosCondicione = await this.terminosCondicioneRepository.findOne({
      where: { id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!terminosCondicione) {
      throw new BadRequestException('Terminos y condiciones no encontrados');
    }
    Object.assign(terminosCondicione, updateTerminosCondicioneDto);
    const update =
      await this.terminosCondicioneRepository.save(terminosCondicione);
    return {
      message: 'Términos y condiciones actualizados correctamente',
      data: update,
    };
  }

  async remove(id: number, user: UserActiveInterface) {
    const terminosCondicione = await this.terminosCondicioneRepository.findOne({
      where: { id, empresa: { id_empresa: user.id_empresa } },
    });
    if (!terminosCondicione) {
      throw new BadRequestException('Terminos y condiciones no encontrados');
    }
    await this.terminosCondicioneRepository.remove(terminosCondicione);
    return {
      message: 'Términos y condiciones eliminados correctamente',
    };
  }
}
