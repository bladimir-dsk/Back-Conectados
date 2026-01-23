import { PartialType } from '@nestjs/swagger';
import { CreatePlanVigenciaDto } from './create-plan-vigencia.dto';

export class UpdatePlanVigenciaDto extends PartialType(CreatePlanVigenciaDto) {}
