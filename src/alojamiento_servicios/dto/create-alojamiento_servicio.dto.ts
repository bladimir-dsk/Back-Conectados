import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateAlojamientoServicioItemDto {
  @ApiProperty()
  @IsNumber()
  servicio_id: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  costo?: number;
}

export class CreateManyAlojamientoServicioDto {
  @ApiProperty()
  @IsNumber()
  alojamiento_id: number;

  @ApiProperty()
  @IsArray()
  servicios: CreateAlojamientoServicioItemDto[];
}
