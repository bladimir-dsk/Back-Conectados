import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PropietariosService } from './propietarios.service';
import { CreatePropietarioDto } from './dto/create-propietario.dto';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { PaginacionDto } from './dto/paginacionDto.dto';

@ApiBearerAuth('jwt')
@ApiTags('Propietarios')
@Controller('propietarios')
export class PropietariosController {
  constructor(private readonly propietariosService: PropietariosService) {}

  @Post()
  @Auth([Role.ADMIN])
  create(
    @Body() createPropietarioDto: CreatePropietarioDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.propietariosService.create(createPropietarioDto, user);
  }

  @Get()
  @Auth([Role.ADMIN])
  findAll(
    @ActiveUser() user: UserActiveInterface,
    @Query() paginacion: PaginacionDto,
  ) {
    return this.propietariosService.findAll(user, paginacion);
  }

  @Get('me')
  @Auth([Role.PROPIETARIO])
  getMyData(@ActiveUser() user: UserActiveInterface) {
    return this.propietariosService.getMyData(user);
  }

  @Get('count')
  @Auth([Role.ADMIN])
  count(@ActiveUser() user: UserActiveInterface) {
    return this.propietariosService.countPropietarios(user);
  }

  @Get(':id')
  @Auth([Role.ADMIN])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.propietariosService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth([Role.ADMIN])
  update(
    @Param('id') id: number,
    @Body() updatePropietarioDto: UpdatePropietarioDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.propietariosService.update(id, updatePropietarioDto, user);
  }

  @Delete(':id')
  @Auth([Role.ADMIN])
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.propietariosService.remove(id, user);
  }
}
