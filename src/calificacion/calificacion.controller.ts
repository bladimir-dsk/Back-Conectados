import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CalificacionService } from './calificacion.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { UpdateCalificacionDto } from './dto/update-calificacion.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiBearerAuth('jwt')
@ApiTags('Calificacion')
@Controller('calificacion')
export class CalificacionController {
  constructor(private readonly calificacionService: CalificacionService) {}

  @Post()
  @Auth(Role.ESTUDIANTE)
  create(
    @Body() createCalificacionDto: CreateCalificacionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.calificacionService.create(createCalificacionDto, user);
  }

  @Get('estadistica/:id_alojamiento')
  @Auth([Role.ESTUDIANTE, Role.ADMIN, Role.PROPIETARIO])
  estadistica(
    @Param('id_alojamiento') id_alojamiento: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.calificacionService.estadistica(id_alojamiento, user);
  }

  @Get()
  @Auth([Role.ESTUDIANTE, Role.ADMIN, Role.PROPIETARIO])
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.calificacionService.findAll(user);
  }

  @Get(':id')
  @Auth([Role.ESTUDIANTE, Role.ADMIN, Role.PROPIETARIO])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.calificacionService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth(Role.ESTUDIANTE)
  update(
    @Param('id') id: number,
    @Body() updateCalificacionDto: UpdateCalificacionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.calificacionService.update(+id, updateCalificacionDto, user);
  }

  @Delete(':id')
  @Auth(Role.ESTUDIANTE)
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.calificacionService.remove(+id, user);
  }
}
