import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RentaService } from './renta.service';
import { CreateRentaDto } from './dto/create-renta.dto';
import { UpdateRentaDto } from './dto/update-renta.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiTags('renta')
@ApiBearerAuth('jwt')
@Controller('renta')
export class RentaController {
  constructor(private readonly rentaService: RentaService) {}

  @Post()
  @Auth([Role.ESTUDIANTE])
  async crearRenta(
    @Body() createRentaDto: CreateRentaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return await this.rentaService.crearRenta(createRentaDto, user);
  }

  @Post(':id/pagar')
  @Auth([Role.ESTUDIANTE])
  async procesarPago(
    @Param('id') id: number,
    @Body() datosPago: any,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return await this.rentaService.procesarPago(id, datosPago, user);
  }
}
