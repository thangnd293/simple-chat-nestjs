import { CreateConversationDto } from './dto/create-conversation.dto';
import { tryCatchWrapper } from 'utils';
import { Conversation } from './schema/conversation.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from 'modules/message/schema/message.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  create = tryCatchWrapper(
    async (createConversationDto: CreateConversationDto) => {
      return await new this.conversationModel(createConversationDto).save();
    },
  );

  getById = tryCatchWrapper(async (id: string) => {
    return await this.conversationModel.findById(new Types.ObjectId(id)).lean();
  });

  getAllByUserId = tryCatchWrapper(async (userId: string) => {
    return await this.conversationModel
      .aggregate([
        { $match: { members: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members',
          },
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'lastMessage',
            foreignField: '_id',
            as: 'lastMessage',
          },
        },
        {
          $project: {
            members: {
              password: 0,
            },
          },
        },
      ])
      .exec();
  });

  getMessagesByConversationId = tryCatchWrapper(
    async (conversationId: string) => {
      return await this.messageModel
        .find({ conversation: conversationId })
        .populate({
          path: 'sender',
          select: '_id name',
        })
        .lean();
    },
  );
}
