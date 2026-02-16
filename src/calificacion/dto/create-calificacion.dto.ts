import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCalificacionDto {
  @ApiProperty()
  @IsInt()
  @Max(5)
  @Min(1)
  puntuacion: number;

  @ApiProperty({
    example: '',
    description: 'Comentario opcional',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || null)
  comentario?: string | null;

  @ApiProperty()
  @IsInt()
  id_alojamiento: number;
}
