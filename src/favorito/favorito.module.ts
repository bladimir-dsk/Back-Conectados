import { Module } from '@nestjs/common';
import { FavoritoService } from './favorito.service';
import { FavoritoController } from './favorito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from './entities/favorito.entity';
import { User } from 'src/users/entities/user.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito, User, Alojamiento])],
  controllers: [FavoritoController],
  providers: [FavoritoService],
  exports: [FavoritoService],
})
export class FavoritoModule {}
