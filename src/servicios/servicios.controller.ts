import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@ApiTags('Servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @Auth([Role.ADMIN])
  create(
    @Body() createServicioDto: CreateServicioDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.serviciosService.create(createServicioDto, user);
  }

  @Get()
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.serviciosService.findAll(user);
  }

  @Get(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.serviciosService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth([Role.ADMIN])
  update(
    @Param('id') id: number,
    @Body() updateServicioDto: UpdateServicioDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.serviciosService.update(+id, updateServicioDto, user);
  }

  @Delete(':id')
  @Auth([Role.ADMIN])
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.serviciosService.remove(+id, user);
  }
}
