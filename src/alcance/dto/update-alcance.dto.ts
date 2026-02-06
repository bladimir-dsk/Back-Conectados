import { PartialType } from '@nestjs/swagger';
import { CreateAlcanceDto } from './create-alcance.dto';

export class UpdateAlcanceDto extends PartialType(CreateAlcanceDto) {}
