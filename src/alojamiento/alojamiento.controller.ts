import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AlojamientoService } from './alojamiento.service';
import { CreateAlojamientoDto } from './dto/create-alojamiento.dto';
import { UpdateAlojamientoDto } from './dto/update-alojamiento.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Query } from '@nestjs/common';

@ApiBearerAuth('jwt')
@ApiTags('Alojamientos')
@Controller('alojamientos')
export class AlojamientoController {
  constructor(private readonly alojamientoService: AlojamientoService) {}

  @Post()
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  create(
    @Body() createAlojamientoDto: CreateAlojamientoDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alojamientoService.create(createAlojamientoDto, user);
  }

  @Get()
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    // @Query('type') type: string,
    // @Query('gender') gender: string,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alojamientoService.findAll(
      { page: Number(page), limit: Number(limit) },
      user,
    );
  }

  @Get(':id/details')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findOneWithDetails(
    @Param('id') id: string,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alojamientoService.findOneWithDetails(+id, user);
  }

  @Get('details')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findMyAlojamientos(
    @ActiveUser() user: UserActiveInterface,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.alojamientoService.findWithDetails(
      { page: Number(page), limit: Number(limit) },
      user,
    );
  }

  @Get(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findOne(@Param('id') id: string, @ActiveUser() user: UserActiveInterface) {
    return this.alojamientoService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  update(
    @Param('id') id: string,
    @Body() updateAlojamientoDto: UpdateAlojamientoDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alojamientoService.update(+id, updateAlojamientoDto, user);
  }

  @Delete(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  remove(@Param('id') id: Number, @ActiveUser() user: UserActiveInterface) {
    return this.alojamientoService.remove(+id, user);
  }
}
