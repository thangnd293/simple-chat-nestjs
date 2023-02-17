import { PipeTransform, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiWsValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new WsException(error.message || 'Validation failed');
    }
    return value;
  }
}
