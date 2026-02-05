import { Module } from '@nestjs/common';
import { AlojamientoServiciosService } from './alojamiento_servicios.service';
import { AlojamientoServiciosController } from './alojamiento_servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlojamientoServicio } from './entities/alojamiento_servicio.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlojamientoServicio,
      Empresa,
      User,
      Alojamiento,
      Servicio,
    ]),
  ],
  controllers: [AlojamientoServiciosController],
  providers: [AlojamientoServiciosService],
  exports: [AlojamientoServiciosService],
})
export class AlojamientoServiciosModule {}
