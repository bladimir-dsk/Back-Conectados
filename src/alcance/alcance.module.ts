import { Module } from '@nestjs/common';
import { AlcanceService } from './alcance.service';
import { AlcanceController } from './alcance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alcance } from './entities/alcance.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alcance, Empresa, User])],
  controllers: [AlcanceController],
  providers: [AlcanceService],
  exports: [AlcanceService],
})
export class AlcanceModule {}
