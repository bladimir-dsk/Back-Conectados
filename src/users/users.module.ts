import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { EmpresaService } from 'src/empresa/empresa.service';
import { School } from 'src/school/entities/school.entity';
import { Documentacion } from 'src/documentacion/entities/documentacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Empresa, School, Documentacion]), //hace que me genere la tabla que le estamos proporcionando en la entity, se genera en la db.
  ],
  controllers: [UsersController],
  providers: [UsersService, EmpresaService],
  //exportamos el modulo de usersservice para que otro modulo lo pueda usar
  exports: [UsersService],
})
export class UsersModule {}
