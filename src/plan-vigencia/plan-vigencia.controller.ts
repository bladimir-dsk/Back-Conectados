import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanVigenciaService } from './plan-vigencia.service';
import { CreatePlanVigenciaDto } from './dto/create-plan-vigencia.dto';
import { UpdatePlanVigenciaDto } from './dto/update-plan-vigencia.dto';

@Controller('plan-vigencia')
export class PlanVigenciaController {
  constructor(private readonly planVigenciaService: PlanVigenciaService) {}

  @Post()
  create(@Body() createPlanVigenciaDto: CreatePlanVigenciaDto) {
    return this.planVigenciaService.create(createPlanVigenciaDto);
  }

  @Get()
  findAll() {
    return this.planVigenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planVigenciaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanVigenciaDto: UpdatePlanVigenciaDto) {
    return this.planVigenciaService.update(+id, updatePlanVigenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planVigenciaService.remove(+id);
  }
}
