import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get()
  @Auth(Role.ADMIN)
  async getEmpresa(@ActiveUser() user: UserActiveInterface) {
    return this.empresaService.getEmpresa(user);
  }

  @Patch()
  @Auth(Role.ADMIN)
  async updateEmpresa(
    // @Param('id') id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.empresaService.updateEmpresa(updateEmpresaDto, user);
  }
}
