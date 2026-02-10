import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmpresaModule } from './empresa/empresa.module';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';

import { ScheduleModule } from '@nestjs/schedule';
import { SchoolModule } from './school/school.module';
import { AlojamientoModule } from './alojamiento/alojamiento.module';
import { PlanModule } from './plan/plan.module';
import { PlanVigenciaModule } from './plan-vigencia/plan-vigencia.module';
import { ServiciosModule } from './servicios/servicios.module';
import { DocumentacionModule } from './documentacion/documentacion.module';
import { PropietariosModule } from './propietarios/propietarios.module';
import { AlojamientoServiciosModule } from './alojamiento_servicios/alojamiento_servicios.module';
import { AlcanceModule } from './alcance/alcance.module';
import { TerminosCondicionesModule } from './terminos-condiciones/terminos-condiciones.module';
import { PoliticaModule } from './politica/politica.module';
import { CuartosModule } from './cuartos/cuartos.module';
import { CamasModule } from './camas/camas.module';
import { RentaModule } from './renta/renta.module';
import { PagoModule } from './pago/pago.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DB_SSL === 'true',
      extra: {
        options: '-c timezone=America/Mexico_City',
        ssl:
          process.env.DB_SSL === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : null,
      },
    }),
    UsersModule,
    AuthModule,
    EmpresaModule,
    SchoolModule,
    AlojamientoModule,
    PlanModule,
    PlanVigenciaModule,
    ServiciosModule,
    DocumentacionModule,
    PropietariosModule,
    AlojamientoServiciosModule,
    AlcanceModule,
    TerminosCondicionesModule,
    PoliticaModule,
    CuartosModule,
    CamasModule,
    RentaModule,
    PagoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
