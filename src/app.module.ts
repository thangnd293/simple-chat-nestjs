import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from './configs/database';

@Module({
  imports: [MongooseModule.forRoot(databaseConfig.url)],
  controllers: [],
  providers: [],
})
export class AppModule {}
