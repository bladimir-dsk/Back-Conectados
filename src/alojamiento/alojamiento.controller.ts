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
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'typeProperty', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, type: String })
  @ApiQuery({ name: 'typeIncome', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'estatus', required: false, type: String })
  @ApiQuery({ name: 'capacity', required: false, type: Number })
  findAll(
    @ActiveUser() user: UserActiveInterface,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('typeProperty') typeProperty?: string,
    @Query('gender') gender?: string,
    @Query('typeIncome') typeIncome?: string,
    @Query('city') city?: string,
    @Query('estatus') estatus?: string,
    @Query('capacity') capacity?: string,
  ) {
    return this.alojamientoService.findAll(
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        name,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        typeProperty,
        gender: gender ? gender.split(',').map((g) => g.trim()) : undefined,
        typeIncome: typeIncome
          ? typeIncome.split(',').map((t) => t.trim())
          : undefined,
        city,
        estatus: estatus ? estatus.split(',').map((e) => e.trim()) : undefined,
        capacity: capacity ? Number(capacity) : undefined,
      },
      user,
    );
  }

  @Get('count')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  count(@ActiveUser() user: UserActiveInterface) {
    return this.alojamientoService.countAlojamientos(user);
  }

  @Get('alojamientos/estatus')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  findAlojamientosByEstatus(@ActiveUser() user: UserActiveInterface) {
    return this.alojamientoService.findAlojamientosByEstatus(user);
  }

  @Get('alojamientos/propietario/:id_propietario')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'typeProperty', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, type: String })
  @ApiQuery({ name: 'typeIncome', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiParam({ name: 'id_propietario', required: true, type: Number })
  @ApiQuery({ name: 'capacity', required: false, type: Number })
  findAllPropietario(
    @ActiveUser() user: UserActiveInterface,
    @Param('id_propietario') id_propietario: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('typeProperty') typeProperty?: string,
    @Query('gender') gender?: string,
    @Query('typeIncome') typeIncome?: string,
    @Query('city') city?: string,
    @Query('capacity') capacity?: string,
  ) {
    return this.alojamientoService.findAllPropietario(
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,

        name,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        typeProperty: typeProperty
          ? typeProperty.split(',').map((t) => t.trim())
          : undefined,
        gender: gender ? gender.split(',').map((g) => g.trim()) : undefined,
        typeIncome: typeIncome
          ? typeIncome.split(',').map((t) => t.trim())
          : undefined,
        city,
        capacity: capacity ? Number(capacity) : undefined,
      },
      user,
      id_propietario,
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
