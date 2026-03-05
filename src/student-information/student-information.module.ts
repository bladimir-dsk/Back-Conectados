import { Module } from '@nestjs/common';
import { StudentInformationService } from './student-information.service';
import { StudentInformationController } from './student-information.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentInformation } from './entities/student-information.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { SupabaseModule } from 'src/common/supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentInformation, User, Empresa]),
    SupabaseModule,
  ],
  controllers: [StudentInformationController],
  providers: [StudentInformationService],
  exports: [StudentInformationService],
})
export class StudentInformationModule {}
