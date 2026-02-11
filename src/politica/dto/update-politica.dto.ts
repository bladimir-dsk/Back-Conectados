import { PartialType } from '@nestjs/swagger';
import { CreatePoliticaDto } from './create-politica.dto';

export class UpdatePoliticaDto extends PartialType(CreatePoliticaDto) {}
