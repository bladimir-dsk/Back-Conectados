import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan) private planRepository: Repository<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto, user: any) {
    const plan = await this.planRepository.create({
      name: createPlanDto.name,
      description: createPlanDto.description,
      userEmail: user.email,
      empresa: { id_empresa: user.id_empresa },
    });
    return this.planRepository.save(plan);
  }

  async findAll() {
    return this.planRepository.find();
  }

  async findOne(id: number) {
    const plan = this.planRepository.findOne({
      where: { id_plan: id },
    });
    if (!plan) {
      throw new NotFoundException(`Plan no encontrado`);
    }
    return plan;
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return this.planRepository.save(plan);
  }

  async remove(id: number) {
    const plan = await this.findOne(id);
    return this.planRepository.remove(plan);
  }
}
