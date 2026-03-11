import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
export class RegisterDto {
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  //transform nos sirve para validar que no envien espacios en blanco
  @Transform(({ value }) => value.trim()) //el value.trim limpia los caracteres en blanco
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  middleName: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  code: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  phone: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  id_empresa?: number;
}
