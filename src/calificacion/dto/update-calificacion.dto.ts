import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCalificacionDto } from './create-calificacion.dto';

export class UpdateCalificacionDto extends PartialType(
  OmitType(CreateCalificacionDto, ['id_alojamiento'] as const),
) {}
