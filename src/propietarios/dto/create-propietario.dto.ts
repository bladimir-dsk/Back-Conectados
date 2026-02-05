import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EstadoPropietario } from 'src/common/enums/estadoPropietario.enum';

export class CreatePropietarioDto {
  @ApiProperty()
  @IsString()
  namePersonal: string;

  @ApiProperty()
  @IsString()
  emailPersonal: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  address: string;

  @IsOptional()
  @IsInt()
  id_empresa?: number;

  @ApiProperty({
    description: 'Define si el propietario tendrá acceso al sistema',
  })
  @IsBoolean()
  aplicaEnUsuario: boolean;

  @ApiProperty({
    description: 'Nombre de usuario (requerido si aplicaEnUsuario es true)',
  })
  @ValidateIf((o) => o.aplicaEnUsuario === true)
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Contraseña (requerida si aplicaEnUsuario es true)',
  })
  @ValidateIf((o) => o.aplicaEnUsuario === true)
  @IsString()
  password?: string;

  @ApiProperty()
  @ValidateIf((o) => o.aplicaEnUsuario === true)
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsEnum(EstadoPropietario)
  estatus: EstadoPropietario;
}
