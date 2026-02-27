import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { StudentInformationService } from './student-information.service';
import { CreateStudentInformationDto } from './dto/create-student-information.dto';
import { UpdateStudentInformationDto } from './dto/update-student-information.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('jwt')
@ApiTags('Informacion del estudiante')
@Controller('student-information')
export class StudentInformationController {
  constructor(
    private readonly studentInformationService: StudentInformationService,
  ) {}

  @Post()
  @Auth([Role.ESTUDIANTE])
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createStudentInformationDto: CreateStudentInformationDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.studentInformationService.create(
      createStudentInformationDto,
      file,
      user,
    );
  }

  @Get()
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.studentInformationService.findAll(user);
  }

  @Get(':id')
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.studentInformationService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth([Role.ESTUDIANTE])
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateStudentInformationDto: UpdateStudentInformationDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.studentInformationService.update(
      +id,
      updateStudentInformationDto,
      user,
      file,
    );
  }

  @Delete(':id')
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.studentInformationService.remove(+id, user);
  }
}
