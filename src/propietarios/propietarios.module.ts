import { Module } from '@nestjs/common';
import { PropietariosService } from './propietarios.service';
import { PropietariosController } from './propietarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Propietario } from './entities/propietario.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Propietario, Empresa, User])],
  controllers: [PropietariosController],
  providers: [PropietariosService],
  exports: [PropietariosService],
})
export class PropietariosModule {}
