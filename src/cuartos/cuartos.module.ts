import { Module } from '@nestjs/common';
import { CuartosService } from './cuartos.service';
import { CuartosController } from './cuartos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuarto } from './entities/cuarto.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { Propietario } from 'src/propietarios/entities/propietario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cuarto,
      Empresa,
      User,
      Alojamiento,
      Servicio,
      PlanVigencia,
      Propietario,
    ]),
  ],
  controllers: [CuartosController],
  providers: [CuartosService],
  exports: [CuartosService],
})
export class CuartosModule {}
