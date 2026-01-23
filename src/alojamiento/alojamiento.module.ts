import { Module } from '@nestjs/common';
import { AlojamientoService } from './alojamiento.service';
import { AlojamientoController } from './alojamiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alojamiento } from './entities/alojamiento.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([Alojamiento])],
  controllers: [AlojamientoController],
  providers: [AlojamientoService],
})
export class AlojamientoModule {}
