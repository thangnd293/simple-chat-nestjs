import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from './configs/database';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [MongooseModule.forRoot(databaseConfig.url), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
