import * as Joi from 'joi';

export class CreateMessageDto {
  conversation: string;
  type: string;
  content: string;
  sender: string;
}

export const CreateMessageDtoSchema = Joi.object({
  conversation: Joi.string().required(),
  type: Joi.string().required().valid('text', 'image', 'file'),
  content: Joi.string().required(),
  sender: Joi.string().required(),
});
