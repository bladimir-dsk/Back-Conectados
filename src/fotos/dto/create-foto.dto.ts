import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateFotoDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
