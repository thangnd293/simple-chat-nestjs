import { Conversation } from 'modules/conversation/schema/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { tryCatchWrapper } from 'utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schema/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  create = tryCatchWrapper(async (createMessageDto: CreateMessageDto) => {
    const { conversation } = createMessageDto;
    const messageSent = await new this.messageModel(createMessageDto).save();
    await this.conversationModel.findByIdAndUpdate(conversation, {
      lastMessage: messageSent._id,
    });

    return messageSent;
  });
}
