import { PartialType } from '@nestjs/swagger';
import { CreateRentaServicioDto } from './create-renta-servicio.dto';

export class UpdateRentaServicioDto extends PartialType(CreateRentaServicioDto) {}
