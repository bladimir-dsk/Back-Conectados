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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @Auth([Role.ADMIN, Role.ESTUDIANTE])
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, type: String })
  findAll(
    @ActiveUser() user: UserActiveInterface,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('gender') gender?: string,
  ) {
    return this.alojamientoService.findAll(
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        type,
        gender,
      },
      user,
    );
  }

  @Get('propietario')
  @Auth(Role.PROPIETARIO)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, type: String })
  findAllPropietario(
    @ActiveUser() user: UserActiveInterface,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('gender') gender?: string,
  ) {
    return this.alojamientoService.findAllPropietario(
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        type,
        gender,
      },
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
