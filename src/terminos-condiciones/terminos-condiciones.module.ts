import { Module } from '@nestjs/common';
import { TerminosCondicionesService } from './terminos-condiciones.service';
import { TerminosCondicionesController } from './terminos-condiciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminosCondicione } from './entities/terminos-condicione.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TerminosCondicione, Empresa, User])],
  controllers: [TerminosCondicionesController],
  providers: [TerminosCondicionesService],
  exports: [TerminosCondicionesService],
})
export class TerminosCondicionesModule {}
