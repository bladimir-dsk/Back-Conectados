import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { DocumentacionService } from './documentacion.service';
import { CreateDocumentacionDto } from './dto/create-documentacion.dto';
import { UpdateDocumentacionDto } from './dto/update-documentacion.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('jwt')
@ApiTags('Documentacion')
@Controller('documentacion')
export class DocumentacionController {
  constructor(private readonly documentacionService: DocumentacionService) {}

  @Post('upload')
  @Auth(Role.ESTUDIANTE)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Body() body: CreateDocumentacionDto,
  ) {
    return this.documentacionService.upload(file, req.user, body);
  }

  @Post('upload/:userId')
  @UseInterceptors(FileInterceptor('file'))
  @Auth(Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  async uploadForUser(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
    @Body() createDocumentacionDto: CreateDocumentacionDto,
  ) {
    console.log('FILE CONTROLLER ===>', file);
    return this.documentacionService.uploadForUser(
      file,
      +userId,
      createDocumentacionDto,
    );
  }

  @Get()
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  findAll(@Req() req: any) {
    return this.documentacionService.findAll(req.user);
  }

  @Get(':id')
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  findOne(@Param('id') id: string, @Req() req) {
    return this.documentacionService.findOne(+id, req.user);
  }

  @Patch(':id')
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDocumentacionDto: UpdateDocumentacionDto,
    @Req() req,
  ) {
    console.log('FILE ===>', file);
    return this.documentacionService.update(
      +id,
      updateDocumentacionDto,
      req.user,
      file,
    );
  }

  @Delete(':id')
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  remove(@Param('id') id: string, @Req() req) {
    return this.documentacionService.remove(+id, req.user);
  }
}
