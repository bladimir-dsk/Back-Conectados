import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Genero } from 'src/common/enums/genero.enum';

export class CreateStudentInformationDto {
  @ApiProperty()
  @IsString()
  curp: string;

  @ApiProperty()
  @IsString()
  codigoPostal: string;

  @ApiProperty()
  @IsString()
  estado: string;

  @ApiProperty()
  @IsString()
  localidad: string;

  @ApiProperty()
  @IsString()
  direccion: string;

  @ApiProperty()
  @IsEnum(Genero)
  genero: Genero;
}
