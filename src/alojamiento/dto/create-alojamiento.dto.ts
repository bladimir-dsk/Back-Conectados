import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray,IsString, IsNumber, IsUrl } from 'class-validator';

export class CreateAlojamientoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  FreeService: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  PaidService: string[];

  @ApiProperty()
  @IsNumber()
  qualification: number;
}
