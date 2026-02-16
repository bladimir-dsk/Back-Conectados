import { Module } from '@nestjs/common';
import { RentaServicioService } from './renta-servicio.service';
import { RentaServicioController } from './renta-servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentaServicio } from './entities/renta-servicio.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Renta } from 'src/renta/entities/renta.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentaServicio, Empresa, User, Renta, Servicio]),
  ],
  controllers: [RentaServicioController],
  providers: [RentaServicioService],
  exports: [RentaServicioService],
})
export class RentaServicioModule {}
