import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsNumber,
  IsInt,
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
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_plan: number;
}
