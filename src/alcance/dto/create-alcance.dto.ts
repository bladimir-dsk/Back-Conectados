import { IsEnum, IsString } from 'class-validator';
import { TipoAlcance } from 'src/common/enums/tipo-alcance.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlcanceDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(TipoAlcance)
  type: TipoAlcance;
}
