import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  min,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginacionDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  paginaActual?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Juan' })
  @IsString()
  namePersonal?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: ['verificado', 'activo'] })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  estatus?: string[];

  @IsOptional()
  @ApiPropertyOptional({ example: 'juan@example.com' })
  @IsString()
  emailPersonal?: string;
}
