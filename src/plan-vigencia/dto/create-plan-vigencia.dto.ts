import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsNumber,
  IsInt,
  IsEmail,
} from 'class-validator';

export class CreatePlanVigenciaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  duration: number;

  @ApiProperty()
  @IsString()
  @IsEmail()
  userEmail: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  id_alojamiento: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  id_plan: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  id_empresa: number;
}
