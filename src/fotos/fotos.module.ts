import { Module } from '@nestjs/common';
import { FotosService } from './fotos.service';
import { FotosController } from './fotos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foto } from './entities/foto.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { SupabaseModule } from 'src/common/supabase/supabase.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Foto, Alojamiento, Empresa, User]),
    SupabaseModule,
  ],
  controllers: [FotosController],
  providers: [FotosService],
  exports: [FotosService],
})
export class FotosModule {}
