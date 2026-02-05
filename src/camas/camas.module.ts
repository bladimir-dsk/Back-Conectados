import { Module } from '@nestjs/common';
import { CamasService } from './camas.service';
import { CamasController } from './camas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cama } from './entities/cama.entity';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { Propietario } from 'src/propietarios/entities/propietario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cama,
      Cuarto,
      Empresa,
      User,
      Alojamiento,
      Servicio,
      PlanVigencia,
      Propietario,
    ]),
  ],
  controllers: [CamasController],
  providers: [CamasService],
  exports: [CamasService],
})
export class CamasModule {}
