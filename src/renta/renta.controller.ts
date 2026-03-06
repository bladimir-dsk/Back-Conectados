import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RentaService } from './renta.service';
import { CreateRentaDto } from './dto/create-renta.dto';
import { UpdateRentaDto } from './dto/update-renta.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { EstadoRenta } from 'src/common/enums/estadoRenta.enum';
import { EstadoPago } from 'src/common/enums/estadoPago.enum';

@ApiTags('renta')
@ApiBearerAuth('jwt')
@Controller('renta')
export class RentaController {
  constructor(private readonly rentaService: RentaService) {}

  @Get()
  @Auth([Role.ESTUDIANTE])
  async findRentasUser(
    @ActiveUser() user: UserActiveInterface,
    @Query('estado') estado?: EstadoRenta,
  ) {
    return await this.rentaService.findRentasUser(user, estado);
  }

  @Get('pagos')
  @Auth([Role.ESTUDIANTE])
  async findRentasPagosUser(
    @ActiveUser() user: UserActiveInterface,
    @Query('estado') estado?: EstadoPago,
  ) {
    return await this.rentaService.findRentasPagosUser(user, estado);
  }

  @Get('pagos/:id')
  @Auth([Role.ESTUDIANTE])
  async findRentasPagosUserIDpago(
    @Param('id') id: number,
    @ActiveUser() user: UserActiveInterface,
    @Query('estado') estado?: EstadoPago,
  ) {
    return await this.rentaService.findRentasPagosUserIDpago(id, user, estado);
  }

  @Post()
  @Auth([Role.ESTUDIANTE])
  async crearRenta(
    @Body() createRentaDto: CreateRentaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return await this.rentaService.crearRenta(createRentaDto, user);
  }

  @Post(':id/iniciar-pago')
  async iniciarPago(
    @Param('id') id: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.rentaService.iniciarPago(id, user);
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
