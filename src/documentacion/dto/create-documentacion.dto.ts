import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoDocumento } from 'src/common/enums/estadoDocumento.enum';
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

  @ApiProperty()
  @IsEnum(EstadoDocumento)
  @IsOptional()
  status?: EstadoDocumento;

  @ApiProperty()
  @IsString()
  @IsOptional()
  observation?: string;
}
