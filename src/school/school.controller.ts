import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Role } from 'src/common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

@ApiBearerAuth('jwt')
@Controller('School')
export class SchoolController {
  constructor(private readonly SchoolService: SchoolService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createSchoolDto: CreateSchoolDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.SchoolService.create(createSchoolDto, user);
  }

  @Get()
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findAll() {
    return this.SchoolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.SchoolService.findOne(+id);
  }

  @Auth(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.SchoolService.update(+id, updateSchoolDto);
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.SchoolService.remove(+id, user);
  }
}
