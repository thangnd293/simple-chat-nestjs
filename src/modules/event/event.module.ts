import { JwtStrategy } from './../auth/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'configs';
import { UserModule } from 'modules/user/user.module';

const { secret, expiresIn } = jwtConfig;

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret,
      signOptions: { expiresIn },
    }),
    UserModule,
  ],
  providers: [EventsGateway, JwtStrategy],
})
export class EventsModule {}
