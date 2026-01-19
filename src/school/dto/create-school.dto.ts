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
  level: NivelEducativo;

  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  length: number;

  @ApiProperty()
  @IsEnum(TipoEscuela)
  type: TipoEscuela;

  @ApiProperty()
  @IsEnum(TurnoEscuela)
  turn: TurnoEscuela;
}
