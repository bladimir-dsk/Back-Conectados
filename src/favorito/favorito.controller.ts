import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FavoritoService } from './favorito.service';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { UpdateFavoritoDto } from './dto/update-favorito.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiTags('Favoritos')
@ApiBearerAuth('jwt')
@Controller('favorito')
export class FavoritoController {
  constructor(private readonly favoritoService: FavoritoService) {}

  @Post(':id_alojamiento')
  @Auth(Role.ESTUDIANTE)
  agregar(
    @ActiveUser() user: UserActiveInterface,
    @Param('id_alojamiento', ParseIntPipe) id_alojamiento: number,
  ) {
    return this.favoritoService.agregar(user, id_alojamiento);
  }

  @Get()
  @Auth(Role.ESTUDIANTE)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @ActiveUser() user: UserActiveInterface,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.favoritoService.findAll(user, { page, limit });
  }

  @Delete(':id_alojamiento')
  @Auth(Role.ESTUDIANTE)
  quitar(
    @ActiveUser() user: UserActiveInterface,
    @Param('id_alojamiento', ParseIntPipe) id_alojamiento: number,
  ) {
    return this.favoritoService.quitar(user, id_alojamiento);
  }
}
