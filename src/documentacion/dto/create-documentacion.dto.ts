import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { TypeDocuments } from 'src/common/enums/typeDocuments.enum';

export class CreateDocumentacionDto {
  // @ApiProperty()
  // @IsString()
  // name: string;

  // @ApiProperty()
  // @IsString()
  // type: string;

  // @ApiProperty()
  // @IsString()
  // size: string;

  // @ApiProperty()
  // @IsString()
  // documentUrl: string;

  @ApiProperty()
  @IsEnum(TypeDocuments)
  typeDocument: TypeDocuments;
}
