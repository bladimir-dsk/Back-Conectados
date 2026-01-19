import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
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
  level: NivelEducativo;

  @ApiProperty()
  @IsLatitude()
  latitud: number;

  @ApiProperty()
  @IsLongitude()
  longitud: number;

  @ApiProperty()
  @IsEnum(TipoEscuela)
  type: TipoEscuela;

  @ApiProperty()
  @IsEnum(TurnoEscuela)
  turn: TurnoEscuela;
}
