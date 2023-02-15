import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'modules/auth/auth.module';
import { EventsModule } from 'modules/event/event.module';
import { databaseConfig } from './configs/database';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.url),
    AuthModule,
    UserModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
