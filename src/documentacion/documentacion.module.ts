import { Module } from '@nestjs/common';
import { DocumentacionService } from './documentacion.service';
import { DocumentacionController } from './documentacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentacion } from './entities/documentacion.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { SupabaseModule } from 'src/common/supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documentacion, Empresa, User]),
    SupabaseModule,
  ],
  controllers: [DocumentacionController],
  providers: [DocumentacionService],
  exports: [DocumentacionService],
})
export class DocumentacionModule {}
