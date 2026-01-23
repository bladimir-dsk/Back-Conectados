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

    @InjectRepository(Alojamiento)
    private readonly alojamientoRepository: Repository<Alojamiento>,

    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createPlanVigenciaDto: CreatePlanVigenciaDto) {
    const alojamiento = await this.alojamientoRepository.findOneBy({
      id_alojamiento: createPlanVigenciaDto.id_alojamiento,
    });
    if (!alojamiento) {
      throw new NotFoundException('Alojamiento no encontrado');
    }
    const plan = await this.planRepository.findOneBy({
      id_plan: createPlanVigenciaDto.id_plan,
    });
    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }
    const empresa = await this.empresaRepository.findOneBy({
      id_empresa: createPlanVigenciaDto.id_empresa,
    });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
    const planVigencia = this.planVigenciaRepository.create({
      name: createPlanVigenciaDto.name,
      price: createPlanVigenciaDto.price,
      duration: createPlanVigenciaDto.duration,
      userEmail: createPlanVigenciaDto.userEmail,
      alojamiento,
      plan,
      empresa,
    });
    return this.planVigenciaRepository.save(planVigencia);
  }

  findAll() {
    return this.planVigenciaRepository.find({
      relations: ['alojamiento', 'plan', 'empresa'],
    });
  }

  findOne(id: number) {
    return this.planVigenciaRepository.findOne({
      where: { id_PlanVigencia: id },
      relations: ['alojamiento', 'plan', 'empresa'],
    });
  }

  update(id: number, updatePlanVigenciaDto: UpdatePlanVigenciaDto) {
    return this.planVigenciaRepository.update(
      { id_PlanVigencia: id },
      updatePlanVigenciaDto,
    );
  }

  remove(id: number) {
    return this.planVigenciaRepository.delete({
      id_PlanVigencia: id,
    });
  }
}
