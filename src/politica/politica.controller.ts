import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PoliticaService } from './politica.service';
import { CreatePoliticaDto } from './dto/create-politica.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';

@ApiBearerAuth('jwt')
@ApiTags('Politicas')
@Controller('politica')
export class PoliticaController {
  constructor(private readonly politicaService: PoliticaService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createPoliticaDto: CreatePoliticaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.politicaService.create(createPoliticaDto, user);
  }

  @Get()
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.politicaService.findAll(user);
  }

  @Get(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.politicaService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id') id: number,
    @Body() updatePoliticaDto: UpdatePoliticaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.politicaService.update(+id, updatePoliticaDto, user);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.politicaService.remove(+id, user);
  }
}
