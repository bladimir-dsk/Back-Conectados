import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlanVigenciaService } from './plan-vigencia.service';
import { CreatePlanVigenciaDto } from './dto/create-plan-vigencia.dto';
import { UpdatePlanVigenciaDto } from './dto/update-plan-vigencia.dto';
import { Role } from 'src/common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@ApiBearerAuth('jwt')
@Controller('plan-vigencia')
export class PlanVigenciaController {
  constructor(private readonly planVigenciaService: PlanVigenciaService) {}

  @Auth(Role.ADMIN)
  @Post()
  create(
    @Body() createPlanVigenciaDto: CreatePlanVigenciaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.planVigenciaService.create(createPlanVigenciaDto, user);
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
  update(
    @Param('id') id: string,
    @Body() updatePlanVigenciaDto: UpdatePlanVigenciaDto,
  ) {
    return this.planVigenciaService.update(+id, updatePlanVigenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planVigenciaService.remove(+id);
  }
}
