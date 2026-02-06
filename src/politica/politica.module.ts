import { Module } from '@nestjs/common';
import { PoliticaService } from './politica.service';
import { PoliticaController } from './politica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Politica } from './entities/politica.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Politica, Empresa, User])],
  controllers: [PoliticaController],
  providers: [PoliticaService],
  exports: [PoliticaService],
})
export class PoliticaModule {}
