import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
@Module({
  imports: [TypeOrmModule.forFeature([School, Empresa, User])],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
