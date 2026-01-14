import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'ziadanyadmin@gmail.com',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @Transform(({ value }) => value.trim())
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: '12345678',
  })
  @Transform(({ value }) => value.trim()) // El value.trim limpia los caracteres en blanco
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  password: string;
}
