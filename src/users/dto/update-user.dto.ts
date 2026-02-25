import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/rol.enum';
import { School } from 'src/school/entities/school.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Estatus } from 'src/common/enums/estatus.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @ApiProperty()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  password?: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsOptional()
  role?: Role;

  @ApiProperty()
  @IsOptional()
  estatus?: Estatus;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id_school?: number;
}
