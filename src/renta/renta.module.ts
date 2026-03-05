import { Module } from '@nestjs/common';
import { RentaService } from './renta.service';
import { RentaController } from './renta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Renta } from './entities/renta.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { User } from 'src/users/entities/user.entity';
import { Cama } from 'src/camas/entities/cama.entity';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { Propietario } from 'src/propietarios/entities/propietario.entity';
import { Pago } from 'src/pago/entities/pago.entity';
import { RentaServicio } from 'src/renta-servicio/entities/renta-servicio.entity';
import { AlojamientoServicio } from 'src/alojamiento_servicios/entities/alojamiento_servicio.entity';
import { StripeWebhookController } from 'src/stripe/stripe.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Renta,
      Empresa,
      Alojamiento,
      User,
      Cama,
      Cuarto,
      Servicio,
      PlanVigencia,
      Propietario,
      Pago,
      AlojamientoServicio,
      RentaServicio,
      // StripeWebhookController,
    ]),
  ],
  controllers: [RentaController],
  providers: [RentaService],
  exports: [RentaService],
})
export class RentaModule {}
