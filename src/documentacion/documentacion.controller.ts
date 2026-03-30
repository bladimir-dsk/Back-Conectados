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
  Query,
} from '@nestjs/common';
import { DocumentacionService } from './documentacion.service';
import { CreateDocumentacionDto } from './dto/create-documentacion.dto';
import { UpdateDocumentacionDto } from './dto/update-documentacion.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@ApiBearerAuth('jwt')
@ApiTags('Documentacion')
@Controller('documentacion')
export class DocumentacionController {
  constructor(private readonly documentacionService: DocumentacionService) {}

  @Get('last-seven-files')
  @Auth(Role.ADMIN)
  getLast7Documentations(@ActiveUser() user: UserActiveInterface) {
    return this.documentacionService.getLast7Documentations(user);
  }

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
  findAll(
    @ActiveUser() user: UserActiveInterface,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.documentacionService.findAll(
      user,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('grouped')
  @Auth([Role.ESTUDIANTE, Role.ADMIN])
  findAllGroupedByUser(
    @ActiveUser() user: UserActiveInterface,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
  ) {
    return this.documentacionService.findAllGroupedByUser(
      user,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      name,
    );
  }

  @Get('status/approved')
  @Auth(Role.ESTUDIANTE)
  documentStatus(@ActiveUser() user: UserActiveInterface) {
    return this.documentacionService.documentAprovate(user);
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

  @Patch(':id/estado')
  @Auth(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  updateEstado(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDocumentacionDto: UpdateDocumentacionDto,
    @Req() req,
  ) {
    console.log('FILE ===>', file);
    return this.documentacionService.updateEstado(
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
