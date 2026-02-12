import { PartialType } from '@nestjs/swagger';
import { CreateFotoDto } from './create-foto.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFotoDto extends PartialType(CreateFotoDto) {
  @IsOptional()
  descripcion?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 'true')
  @IsBoolean()
  esPrincipal?: boolean;
}
