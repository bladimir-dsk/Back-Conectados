import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { Pago } from './entities/pago.entity';
import { Renta } from 'src/renta/entities/renta.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { User } from 'src/users/entities/user.entity';
import { Cama } from 'src/camas/entities/cama.entity';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { Propietario } from 'src/propietarios/entities/propietario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pago,
      Renta,
      Empresa,
      Alojamiento,
      User,
      Cama,
      Cuarto,
      Servicio,
      PlanVigencia,
      Propietario,
    ]),
  ],
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService],
})
export class PagoModule {}
