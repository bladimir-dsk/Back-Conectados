import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { FotosService } from './fotos.service';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('jwt')
@ApiTags('Fotos')
@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Post()
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @ActiveUser() user: UserActiveInterface,
    @Body('id_alojamiento') id_alojamiento: number,
    @Body('esPrincipal') esPrincipal: boolean,
    @Body('descripcion') descripcion?: string,
  ) {
    return this.fotosService.create(
      user,
      Number(id_alojamiento),
      esPrincipal,
      files,
      descripcion,
    );
  }

  @Get()
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.fotosService.findAll(user);
  }

  @Get(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO, Role.ESTUDIANTE])
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.fotosService.findOne(+id, user);
  }

  @Patch(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: number,
    @Body() updateFotoDto: UpdateFotoDto,
    @ActiveUser() user: UserActiveInterface,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.fotosService.update(+id, updateFotoDto, user, file);
  }

  @Delete(':id')
  @Auth([Role.ADMIN, Role.PROPIETARIO])
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.fotosService.remove(+id, user);
  }
}
