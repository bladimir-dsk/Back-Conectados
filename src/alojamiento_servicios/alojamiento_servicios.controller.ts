import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AlojamientoServiciosService } from './alojamiento_servicios.service';
import { CreateManyAlojamientoServicioDto } from './dto/create-alojamiento_servicio.dto';
import { SyncAlojamientoServiciosDto } from './dto/update-alojamiento_servicio.dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from 'src/common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiBasicAuth('jwt')
@ApiTags('Servicios para alojamientos')
@Controller('alojamiento-servicios')
export class AlojamientoServiciosController {
  constructor(
    private readonly alojamientoServiciosService: AlojamientoServiciosService,
  ) {}

  @Post()
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  create(
    @Body() createAlojamientoServicioDto: CreateManyAlojamientoServicioDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alojamientoServiciosService.createMany(
      createAlojamientoServicioDto,
      user,
    );
  }

  @Get('alojamiento/:alojamientoId')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  findAllByAlojamiento(
    @Param('alojamientoId') alojamientoId: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alojamientoServiciosService.findAllByAlojamiento(
      +alojamientoId,
      user,
    );
  }

  @Patch('alojamiento/:alojamientoId/sync')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  syncServicios(
    @Param('alojamientoId') alojamientoId: number,
    @Body() dto: SyncAlojamientoServiciosDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alojamientoServiciosService.syncServicios(
      +alojamientoId,
      dto,
      user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.alojamientoServiciosService.remove(id, user);
  }
}
