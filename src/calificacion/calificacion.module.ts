import { Module } from '@nestjs/common';
import { CalificacionService } from './calificacion.service';
import { CalificacionController } from './calificacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Calificacion } from './entities/calificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Calificacion, Alojamiento, Empresa, User]),
  ],
  controllers: [CalificacionController],
  providers: [CalificacionService],
  exports: [CalificacionService],
})
export class CalificacionModule {}
