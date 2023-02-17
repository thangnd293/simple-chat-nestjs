import {
  Conversation,
  ConversationSchema,
} from 'modules/conversation/schema/conversation.schema';
import { MessageController } from './message.controller';
import { MessageSchema } from './schema/message.schema';
import { Message } from 'modules/message/schema/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
