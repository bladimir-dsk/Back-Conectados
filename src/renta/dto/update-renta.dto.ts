import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRentaDto } from './create-renta.dto';
import { IsEnum, IsNumber } from 'class-validator';
import { EstadoRenta } from 'src/common/enums/estadoRenta.enum';

export class UpdateRentaDto extends PartialType(CreateRentaDto) {}

export class UpdateEstadoRentaDto {
  @ApiProperty()
  @IsNumber()
  id_renta: number;

  @ApiProperty()
  @IsEnum(EstadoRenta)
  estado: EstadoRenta;
}
