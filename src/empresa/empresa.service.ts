import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Repository } from 'typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async getEmpresa(user: UserActiveInterface) {
    return this.empresaRepository.find({
      where: {
        id_empresa: user.id_empresa,
      },
    });
  }
  async updateEmpresa(
    id: number,
    updateEmpresaDto: UpdateEmpresaDto,
    user: UserActiveInterface,
  ) {
    const usuario = await this.userRepository.findOne({
      where: { email: user.email },
      relations: ['empresa'],
    });

    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: id },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    await this.empresaRepository.update(id, {
      ...updateEmpresaDto,
      id_empresa: user.id_empresa,
    });
    return this.empresaRepository.findOne({
      where: { id_empresa: id },
    });
  }
}
