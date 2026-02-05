import { Module } from '@nestjs/common';
import { AlojamientoService } from './alojamiento.service';
import { AlojamientoController } from './alojamiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alojamiento } from './entities/alojamiento.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Propietario } from 'src/propietarios/entities/propietario.entity';
import { AlojamientoServicio } from 'src/alojamiento_servicios/entities/alojamiento_servicio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alojamiento,
      Empresa,
      User,
      Servicio,
      PlanVigencia,
      Propietario,
      AlojamientoServicio,
    ]),
  ],
  controllers: [AlojamientoController],
  providers: [AlojamientoService],
  exports: [AlojamientoService],
})
export class AlojamientoModule {}
