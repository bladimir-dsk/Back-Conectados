import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanVigenciaDto } from './dto/create-plan-vigencia.dto';
import { UpdatePlanVigenciaDto } from './dto/update-plan-vigencia.dto';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanVigencia } from './entities/plan-vigencia.entity';

@Injectable()
export class PlanVigenciaService {
  constructor(
    @InjectRepository(PlanVigencia)
    private readonly planVigenciaRepository: Repository<PlanVigencia>,
    @InjectRepository(Plan) private readonly planRepository: Repository<Plan>,
  ) {}

  async create(createPlanVigenciaDto: CreatePlanVigenciaDto, user: any) {
    const plan = await this.planRepository.findOne({
      where: {
        id_plan: createPlanVigenciaDto.id_plan,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa'],
    });
    if (!plan) {
      throw new NotFoundException(`Plan no encontrado`);
    }
    const planVigencia = this.planVigenciaRepository.create({
      name: createPlanVigenciaDto.name,
      price: createPlanVigenciaDto.price,
      duration: createPlanVigenciaDto.duration,
      plan,
      empresa: plan.empresa,
      userEmail: user.email,
    });
    return this.planVigenciaRepository.save(planVigencia);
  }

  findAll() {
    return this.planVigenciaRepository.find({
      relations: ['plan', 'empresa'],
    });
  }

  findOne(id: number) {
    return this.planVigenciaRepository.findOne({
      where: { id_PlanVigencia: id },
      relations: ['plan', 'empresa'],
    });
  }

  async update(id: number, updatePlanVigenciaDto: UpdatePlanVigenciaDto) {
    const planVigencia = await this.planVigenciaRepository.findOne({
      where: { id_PlanVigencia: id },
    });
    if (!planVigencia) {
      throw new NotFoundException(`Plan no encontrado`);
    }
    if (Object.keys(updatePlanVigenciaDto).length === 0) {
      throw new NotFoundException(`No hay datos para actualizar`);
    }
    Object.assign(planVigencia, updatePlanVigenciaDto);
    return this.planVigenciaRepository.save(planVigencia);
  }

  remove(id: number) {
    return this.planVigenciaRepository.delete({
      id_PlanVigencia: id,
    });
  }
}
