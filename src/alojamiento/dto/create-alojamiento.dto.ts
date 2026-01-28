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
} from 'class-validator';

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
  type: string;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsNumber()
  qualification: number;

  @ApiProperty()
  @IsInt()
  id_PlanVigencia: number;

  @ApiProperty({
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  id_servicio?: number[];
}
