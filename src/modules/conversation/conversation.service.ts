import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Message,
  MessageDocument,
} from 'modules/message/schema/message.schema';
import { Model, Types } from 'mongoose';
import { tryCatchWrapper } from 'utils';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from './schema/conversation.schema';

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
    async (conversationId: string, sender: string) => {
      const conversation = await this.conversationModel
        .findById(new Types.ObjectId(conversationId))
        .populate({
          path: 'members',
          select: '_id isOnline lastOnline',
        })
        .lean();

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

      const lastReceiverSeen = conversation.lastSeen.find(
        (action) => action.user.toString() === receiver._id.toString(),
      );

      const lastSenderSeen = conversation.lastSeen.find(
        (action) => action.user.toString() !== receiver._id.toString(),
      );

      const messages = data.map((message) => {
        if (
          message.sender._id.toString() !== sender &&
          message.createdAt.getTime() <= lastSenderSeen.time.getTime()
        )
          return {
            ...message,
            status: 'seen',
          };

        if (
          message.sender._id.toString() === sender &&
          message.createdAt.getTime() <= lastReceiverSeen.time.getTime()
        ) {
          return {
            ...message,
            status: 'seen',
          };
        }

        const isReceived =
          receiver.isOnline ||
          message.createdAt.getTime() <= receiver.lastOnline.getTime();

        return {
          ...message,
          status: isReceived ? 'received' : message.status,
        };
      });

      return messages;
    },
  );

  updateLastSeen = tryCatchWrapper(
    async (conversationId: Types.ObjectId, userSeenId: Types.ObjectId) => {
      const updatedConversation = await this.conversationModel.findOneAndUpdate(
        {
          _id: conversationId,
          'lastSeen.user': userSeenId,
        },
        {
          $set: {
            'lastSeen.$.time': new Date(),
          },
        },
        {
          new: true,
        },
      );

      if (!updatedConversation) {
        await this.conversationModel.updateOne(
          { _id: conversationId },
          { $push: { lastSeen: { user: userSeenId, time: new Date() } } },
        );
      }

      return updatedConversation;
    },
  );
}
