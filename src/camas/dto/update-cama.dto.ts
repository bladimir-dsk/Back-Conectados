import { PartialType } from '@nestjs/swagger';
import { CreateCamaDto } from './create-cama.dto';

export class UpdateCamaDto extends PartialType(CreateCamaDto) {}
