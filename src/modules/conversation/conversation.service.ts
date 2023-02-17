import { CreateConversationDto } from './dto/create-conversation.dto';
import { tryCatchWrapper } from 'utils';
import { Conversation } from './schema/conversation.schema';
import { Injectable, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import {
  Message,
  MessageDocument,
} from 'modules/message/schema/message.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  create = tryCatchWrapper(
    async (createConversationDto: CreateConversationDto) => {
      console.log('createConversationDto', createConversationDto);

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
    async (conversationId: string, sender: string) => {
      const conversation = await this.conversationModel
        .findById(new Types.ObjectId(conversationId))
        .populate({
          path: 'members',
          select: '_id isOnline lastOnline',
        })
        .lean();

      console.log('conversation', conversation);

      if (!conversation) throw new Error('Conversation not found');

      const receiver = conversation.members.find(
        (member) => member._id.toString() !== sender,
      );

      const data: MessageDocument[] = await this.messageModel
        .find({ conversation: conversation._id })
        .populate({
          path: 'sender',
          select: '_id name',
        })
        .lean();

      const messages = data.map((message) => {
        if (message.sender._id.toString() === sender) {
          return {
            ...message,
            status: receiver.isOnline ? 'received' : message.status,
          };
        }
        return message;
      });
      return messages;
    },
  );

  updateLastReceived = tryCatchWrapper(
    async (conversationId: Types.ObjectId, receiverId: Types.ObjectId) => {
      const conversation = await this.conversationModel
        .findById(conversationId)
        .exec();

      const lastReceivedFiltered = conversation.lastReceived.filter(
        (active) => active.user.toString() !== receiverId.toString(),
      );

      const newTimestamp = {
        user: receiverId,
        time: new Date(),
      };

      const conversationUpdated = (conversation.lastReceived = [
        ...lastReceivedFiltered,
        newTimestamp,
      ]);
      await conversation.save();

      return conversationUpdated;
    },
  );
}
