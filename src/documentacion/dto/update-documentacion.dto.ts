import { PartialType } from '@nestjs/swagger';
import { CreateDocumentacionDto } from './create-documentacion.dto';

export class UpdateDocumentacionDto extends PartialType(
  CreateDocumentacionDto,
) {}
