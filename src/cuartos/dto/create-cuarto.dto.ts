import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';

export class CreateCuartoDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiProperty()
  price: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  description?: string;

  @IsEnum(EstadoAlojamiento)
  @ApiProperty()
  estatus: EstadoAlojamiento;

  @IsInt()
  @ApiProperty()
  id_alojamiento: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  identification?: string;
}
