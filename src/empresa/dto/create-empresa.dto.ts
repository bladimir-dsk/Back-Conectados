import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateEmpresaDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(13, { message: 'El RFC no puede tener más de 13 caracteres' })
  @MinLength(12, { message: 'El RFC no puede tener menos de 12 caracteres' })
  // @IsOptional()
  rfc?: string;
}
