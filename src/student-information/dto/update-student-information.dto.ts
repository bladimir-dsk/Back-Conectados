import { PartialType } from '@nestjs/swagger';
import { CreateStudentInformationDto } from './create-student-information.dto';

export class UpdateStudentInformationDto extends PartialType(CreateStudentInformationDto) {}
