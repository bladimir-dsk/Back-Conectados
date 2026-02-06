import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';

export class CreateCamaDto {
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

  @IsString()
  @ApiProperty()
  @IsOptional()
  identification?: string;

  @IsInt()
  @ApiProperty()
  id_cuarto: number;
}
