import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiTags('Pagos')
@ApiBearerAuth('jwt')
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Get('ganancias-by-month')
  @Auth(Role.ADMIN)
  getGananciasByMonth(@ActiveUser() user: UserActiveInterface) {
    return this.pagoService.getGananciasByMonth(user);
  }
}
