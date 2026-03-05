import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';
import { TipoRenta } from 'src/common/enums/tipoRenta.enum';

export class CreateAlojamientoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  typeProperty: string;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsEnum(TipoRenta)
  typeIncome: TipoRenta;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  codePostal: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  latitude: string;

  @ApiProperty()
  @IsString()
  longitude: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsEnum(EstadoAlojamiento)
  estatus: EstadoAlojamiento;

  @ApiProperty()
  @IsNumber()
  precio_completo: number;

  // @ApiProperty()
  // @IsInt()
  // id_PlanVigencia: number;

  @ApiProperty()
  @IsInt()
  id_Propietario: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  capacity?: number;
}
