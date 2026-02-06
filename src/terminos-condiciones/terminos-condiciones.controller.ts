import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TerminosCondicionesService } from './terminos-condiciones.service';
import { CreateTerminosCondicioneDto } from './dto/create-terminos-condicione.dto';
import { UpdateTerminosCondicioneDto } from './dto/update-terminos-condicione.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@ApiBearerAuth('jwt')
@ApiTags('Terminos y condiciones')
@Controller('terminos-condiciones')
export class TerminosCondicionesController {
  constructor(
    private readonly terminosCondicionesService: TerminosCondicionesService,
  ) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createTerminosCondicioneDto: CreateTerminosCondicioneDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.terminosCondicionesService.create(
      createTerminosCondicioneDto,
      user,
    );
  }

  @Get()
  @Auth([Role.ADMIN, Role.ESTUDIANTE, Role.PROPIETARIO])
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.terminosCondicionesService.findAll(user);
  }

  @Get(':id')
  @Auth([Role.ADMIN, Role.ESTUDIANTE, Role.PROPIETARIO])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.terminosCondicionesService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id') id: number,
    @Body() updateTerminosCondicioneDto: UpdateTerminosCondicioneDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.terminosCondicionesService.update(
      +id,
      updateTerminosCondicioneDto,
      user,
    );
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: string, @ActiveUser() user: UserActiveInterface) {
    return this.terminosCondicionesService.remove(+id, user);
  }
}
