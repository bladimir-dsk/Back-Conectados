import { PartialType } from '@nestjs/swagger';
import { CreateRentaDto } from './create-renta.dto';

export class UpdateRentaDto extends PartialType(CreateRentaDto) {}
