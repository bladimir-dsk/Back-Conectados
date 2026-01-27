import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  icon: string;

  @IsBoolean()
  @ApiProperty()
  aplique_paid: boolean;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  price?: number;
}
