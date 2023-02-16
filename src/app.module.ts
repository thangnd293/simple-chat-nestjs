import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'modules/auth/auth.module';
import { ConversationModule } from 'modules/conversation/conversation.module';
import { EventsModule } from 'modules/event/event.module';
import { MessageModule } from 'modules/message/message.module';
import { databaseConfig } from './configs/database';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.url),
    AuthModule,
    UserModule,
    EventsModule,
    ConversationModule,
    MessageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
