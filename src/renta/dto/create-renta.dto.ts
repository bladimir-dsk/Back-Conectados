import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { TipoRenta } from 'src/common/enums/tipoRenta.enum';
import { Type } from 'class-transformer';

export class CreateRentaDto {
  @IsEnum(TipoRenta)
  @ApiProperty({ enum: TipoRenta })
  tipo_renta: TipoRenta;

  @ValidateIf((o) => o.tipo_renta === TipoRenta.ALOJAMIENTO_COMPLETO)
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: false })
  id_alojamiento?: number;

  @ValidateIf((o) => o.tipo_renta === TipoRenta.CUARTO)
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: false })
  id_cuarto?: number;

  @ValidateIf((o) => o.tipo_renta === TipoRenta.CAMA)
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: false })
  id_cama?: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({ type: Number })
  id_usuario: number;

  @IsDateString()
  @ApiProperty({ type: String, example: '2025-02-09' })
  fecha_entrada: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  @ApiProperty({ type: Number, minimum: 1, maximum: 12 })
  meses_a_pagar: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: false })
  monto_pago?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: false })
  precio_mensual?: number;
}
