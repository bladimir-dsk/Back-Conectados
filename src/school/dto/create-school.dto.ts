import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  NivelEducativo,
  TipoEscuela,
  TurnoEscuela,
} from '../entities/school.entity';

export class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cct: string;

  @ApiProperty()
  @IsEnum(NivelEducativo)
  nivel: NivelEducativo;

  @ApiProperty()
  @IsNumber()
  latitud: number;

  @ApiProperty()
  @IsNumber()
  longitud: number;

  @ApiProperty()
  @IsEnum(TipoEscuela)
  tipo: TipoEscuela;

  @ApiProperty()
  @IsEnum(TurnoEscuela)
  turno: TurnoEscuela;
}
