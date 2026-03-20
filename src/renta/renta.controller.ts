import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { RentaService } from './renta.service';
import { CreateRentaDto } from './dto/create-renta.dto';
import { UpdateRentaDto } from './dto/update-renta.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { EstadoRenta } from 'src/common/enums/estadoRenta.enum';
import { EstadoPago } from 'src/common/enums/estadoPago.enum';
import { UpdateEstadoRentaDto } from './dto/update-renta.dto';
import { TipoRenta } from 'src/common/enums/tipoRenta.enum';

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

  @Get('propietario/:id')
  @Auth([Role.PROPIETARIO])
  async obtenerPropietarioDeRenta(
    @Param('id') id: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return await this.rentaService.obtenerPropietarioDeRenta(id, user);
  }

  @Get('propietario/:id/reporte')
  @Auth([Role.PROPIETARIO])
  //que sean opcionales en swager
  @ApiQuery({ name: 'fechaDesde', required: false, type: String })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String })
  @ApiQuery({ name: 'estado', required: false, type: String })
  async reporteGananciasPropietario(
    @Param('id') id: number,
    @ActiveUser() user: UserActiveInterface,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('estado') estado?: EstadoRenta,
  ) {
    return await this.rentaService.reporteGananciasPropietario(id, user, {
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
      estado,
    });
  }

  // @Get('control-financiero')
  // @Auth([Role.PROPIETARIO])
  // @ApiQuery({ name: 'id', required: true, type: Number })
  // @ApiQuery({ name: 'fechaDesde', required: false, type: String })
  // @ApiQuery({ name: 'fechaHasta', required: false, type: String })
  // @ApiQuery({ name: 'estado', required: false, type: String })
  // @ApiQuery({ name: 'estadoPago', required: false, type: String })
  // @ApiQuery({ name: 'tipo_renta', required: false, type: String })
  // ✅ Después — lee de query y parsea a número explícitamente
  @Get('control-financiero')
  @Auth([Role.PROPIETARIO, Role.ADMIN])
  @ApiQuery({ name: 'id', required: false, type: Number })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String })
  @ApiQuery({ name: 'estado', required: false, type: String })
  @ApiQuery({ name: 'estadoPago', required: false, type: String })
  @ApiQuery({ name: 'tipo_renta', required: false, type: String })
  async reporteControlFinanciero(
    @Query('id') id?: string, // 👈 string | undefined
    @ActiveUser() user?: UserActiveInterface,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('estado') estado?: EstadoRenta,
    @Query('estadoPago') estadoPago?: EstadoPago,
    @Query('tipo_renta') tipo_renta?: TipoRenta,
  ) {
    // Si viene id, lo parseamos y validamos; si no viene, queda undefined
    let idPropietario: number | undefined;

    if (id !== undefined) {
      // 👈 solo valida si realmente viene
      idPropietario = Number(id);
      if (isNaN(idPropietario)) {
        throw new BadRequestException(
          'El parámetro id debe ser un número válido',
        );
      }
    }

    return this.rentaService.reporteControlFinanciero(idPropietario, user, {
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
      estadoRenta: estado,
      estadoPago,
      tipo_renta,
    });
  }
  @Get('pagos')
  @Auth([Role.ESTUDIANTE])
  async findRentasPagosUser(
    @ActiveUser() user: UserActiveInterface,
    @Query('estado') estado?: EstadoPago,
  ) {
    return await this.rentaService.findRentasPagosUser(user, estado);
  }

  @Get('count-rentas-by-month')
  @Auth([Role.ADMIN])
  async getCountRentasByMonth(@ActiveUser() user: UserActiveInterface) {
    return await this.rentaService.getCountRentasByMonth(user);
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

  @Patch('EstadoRenta')
  @Auth([Role.ESTUDIANTE])
  async actualizarEstado(
    @Body() updateEstadoRentaDto: UpdateEstadoRentaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.rentaService.actualizarEstadoRenta(updateEstadoRentaDto, user);
  }
}
