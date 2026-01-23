import { Module } from '@nestjs/common';
import { PlanVigenciaService } from './plan-vigencia.service';
import { PlanVigenciaController } from './plan-vigencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanVigencia } from './entities/plan-vigencia.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanVigencia, Alojamiento, Plan, Empresa]),
  ],
  controllers: [PlanVigenciaController],
  providers: [PlanVigenciaService],
})
export class PlanVigenciaModule {}
