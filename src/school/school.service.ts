import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { Repository } from 'typeorm';
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

  async create(CreateSchoolDto: CreateSchoolDto) {
    return this.schoolRepository.save(CreateSchoolDto);
  }

  findAll() {
    return this.schoolRepository.find();
  }

  async findOne(id: number) {
    const School = await this.schoolRepository.findOneBy({ id_school: id });
    if (!School) {
      throw new BadRequestException('No existe la escuela con ese id');
    }
    return School;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto) {
    const School = await this.schoolRepository.findOneBy({ id_school: id });
    if (!School) {
      throw new BadRequestException('No existe la escuela con ese id');
    }
    return await this.schoolRepository.update(id, {
      ...updateSchoolDto,
    });
  }

  async remove(id: number, user: UserActiveInterface) {
    if (user.role !== Role.ADMIN) {
      throw new BadRequestException(
        'Solo los usuarios con perfil de Adminitrador pueden acceder a esta información',
      );
    }
    const School = await this.schoolRepository.findOneBy({ id_school: id });
    if (!School) {
      throw new BadRequestException('No existe la escuela con ese id');
    }
    return await this.schoolRepository.remove(School);
  }
}
