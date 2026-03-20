import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { Between, Repository } from 'typeorm';
import { Role } from 'src/common/enums/rol.enum';
import { User } from 'src/users/entities/user.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { create } from 'domain';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}
  async create(CreateSchoolDto: CreateSchoolDto, user: UserActiveInterface) {
    const School = await this.schoolRepository.create({
      ...CreateSchoolDto,
      userEmail: user.email,
      empresa: { id_empresa: user.id_empresa },
    });
    return this.schoolRepository.save(School);
  }

  findAll(user: UserActiveInterface) {
    return this.schoolRepository.find({
      where: { empresa: { id_empresa: user.id_empresa } },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const School = await this.schoolRepository.findOneBy({
      id_school: id,
      empresa: { id_empresa: user.id_empresa },
    });
    if (!School) {
      throw new BadRequestException('No existe la escuela con ese id');
    }
    return School;
  }

  async update(
    id: number,
    updateSchoolDto: UpdateSchoolDto,
    user: UserActiveInterface,
  ) {
    const School = await this.findOne(id, user);
    Object.assign(School, updateSchoolDto);
    return this.schoolRepository.save(School);
  }

  async remove(id: number, user: UserActiveInterface) {
    if (user.role !== Role.ADMIN) {
      throw new BadRequestException(
        'Solo los usuarios con perfil de Adminitrador pueden acceder a esta información',
      );
    }
    const School = await this.findOne(id, user);
    return this.schoolRepository.remove(School);
  }

  //contar las escuelas
  async count(user: UserActiveInterface) {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const whereBase = {
      empresa: {
        id_empresa: user.id_empresa,
      },
    };

    // 🔹 total general
    const total = await this.schoolRepository.count({
      where: whereBase,
    });

    // 🔹 total del mes actual
    const totalMes = await this.schoolRepository.count({
      where: {
        ...whereBase,
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    return {
      total,
      nuevosdelmes: totalMes,
    };
  }
}
