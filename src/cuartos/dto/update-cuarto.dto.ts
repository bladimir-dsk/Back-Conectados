import { PartialType } from '@nestjs/swagger';
import { CreateCuartoDto } from './create-cuarto.dto';

export class UpdateCuartoDto extends PartialType(CreateCuartoDto) {}
