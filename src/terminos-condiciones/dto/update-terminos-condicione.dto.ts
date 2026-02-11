import { PartialType } from '@nestjs/swagger';
import { CreateTerminosCondicioneDto } from './create-terminos-condicione.dto';

export class UpdateTerminosCondicioneDto extends PartialType(
  CreateTerminosCondicioneDto,
) {}
