import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsArray,
  IsString,
  IsNumber,
  IsUrl,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';

export class CreateAlojamientoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsString()
  typeProperty: string;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsString()
  typeIncome: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  codePostal: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  latitude: string;

  @ApiProperty()
  @IsString()
  longitude: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsEnum(EstadoAlojamiento)
  estatus: EstadoAlojamiento;

  @ApiProperty()
  @IsInt()
  id_PlanVigencia: number;

  @ApiProperty()
  @IsInt()
  id_Propietario: number;
}
