import * as Joi from 'joi';

export class CreateMessageDto {
  conversation: string;
  receiver: string;
  type: string;
  content: string;
}

export const CreateMessageDtoSchema = Joi.object({
  conversation: Joi.string().required(),
  type: Joi.string().required().valid('text', 'image', 'file'),
  receiver: Joi.string().required(),
  content: Joi.string().required(),
});
