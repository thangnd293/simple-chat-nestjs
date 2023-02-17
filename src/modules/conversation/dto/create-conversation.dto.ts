import * as Joi from 'joi';

export class CreateConversationDto {
  members: string[];
  lastMessage: string;
  lastReceived: {
    user: string;
    time: Date;
  };
}

export const CreateConversationSchema = Joi.object({
  members: Joi.array().items(Joi.string()).required(),
  lastMessage: Joi.string(),
});
