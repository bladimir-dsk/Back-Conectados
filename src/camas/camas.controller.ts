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
import { CamasService } from './camas.service';
import { CreateCamaDto } from './dto/create-cama.dto';
import { UpdateCamaDto } from './dto/update-cama.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from 'src/common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Camas')
@ApiBearerAuth('jwt')
@Controller('camas')
export class CamasController {
  constructor(private readonly camasService: CamasService) {}

  @Post()
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  create(
    @Body() createCamaDto: CreateCamaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.camasService.create(createCamaDto, user);
  }

  @Get()
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @ActiveUser() user?: UserActiveInterface,
  ) {
    return this.camasService.findAll(
      {
        page: page ? +page : undefined,
        limit: limit ? +limit : undefined,
      },
      user,
    );
  }

  @Get('cuarto/:cuartoId')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findByCuarto(
    @Param('cuartoId') cuartoId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @ActiveUser() user?: UserActiveInterface,
  ) {
    return this.camasService.findByCuarto(
      cuartoId,
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
    return this.camasService.findOne(id, user);
  }

  @Patch(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  update(
    @Param('id') id: number,
    @Body() updateCamaDto: UpdateCamaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.camasService.update(id, updateCamaDto, user);
  }

  @Delete(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.camasService.remove(id, user);
  }
}
