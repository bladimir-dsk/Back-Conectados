import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AlcanceService } from './alcance.service';
import { CreateAlcanceDto } from './dto/create-alcance.dto';
import { UpdateAlcanceDto } from './dto/update-alcance.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@ApiBearerAuth('jwt')
@ApiTags('Alcance')
@Controller('alcance')
export class AlcanceController {
  constructor(private readonly alcanceService: AlcanceService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createAlcanceDto: CreateAlcanceDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alcanceService.create(createAlcanceDto, user);
  }

  @Get()
  @Auth([Role.ADMIN, Role.ESTUDIANTE, Role.PROPIETARIO])
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.alcanceService.findAll(user);
  }

  @Get(':id')
  @Auth([Role.ADMIN, Role.ESTUDIANTE, Role.PROPIETARIO])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.alcanceService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id') id: number,
    @Body() updateAlcanceDto: UpdateAlcanceDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.alcanceService.update(+id, updateAlcanceDto, user);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.alcanceService.remove(+id, user);
  }
}
