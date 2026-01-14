import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { EmpresaModule } from 'src/empresa/empresa.module';

@Module({
  imports: [
    UsersModule,
    EmpresaModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }, //el token expira despues de un dia
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
