import { HttpException, HttpStatus } from '@nestjs/common';

export function tryCatchWrapper<T>(cb: (...args: any) => Promise<T>) {
  return (...args) => {
    try {
      return cb(...args);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
}
