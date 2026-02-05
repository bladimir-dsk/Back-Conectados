import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class SyncAlojamientoServicioItemDto {
  @IsNumber()
  @ApiProperty()
  servicio_id: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ nullable: true })
  costo: number | null;
}

export class SyncAlojamientoServiciosDto {
  @ApiProperty()
  @IsArray()
  servicios: SyncAlojamientoServicioItemDto[];
}
