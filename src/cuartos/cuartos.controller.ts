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
import { CuartosService } from './cuartos.service';
import { CreateCuartoDto } from './dto/create-cuarto.dto';
import { UpdateCuartoDto } from './dto/update-cuarto.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Cuartos')
@ApiBearerAuth('jwt')
@Controller('cuartos')
export class CuartosController {
  constructor(private readonly cuartosService: CuartosService) {}

  @Post()
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  create(
    @Body() createCuartoDto: CreateCuartoDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.cuartosService.create(createCuartoDto, user);
  }

  @Get()
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.cuartosService.findAll(
      { page: Number(page), limit: Number(limit) },
      user,
    );
  }

  @Get('alojamiento/:alojamientoId')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findByAlojamiento(
    @ActiveUser() user: UserActiveInterface,
    @Param('alojamientoId') alojamientoId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cuartosService.findByAlojamiento(
      +alojamientoId,
      {
        page: page ? +page : undefined,
        limit: limit ? +limit : undefined,
      },
      user,
    );
  }

  @Get(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.cuartosService.findOne(id, user);
  }

  @Patch(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  update(
    @Param('id') id: number,
    @Body() updateCuartoDto: UpdateCuartoDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.cuartosService.update(id, updateCuartoDto, user);
  }

  @Delete(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.cuartosService.remove(+id, user);
  }
}
