import { HttpException, HttpStatus } from '@nestjs/common';

export function tryCatchWrapper<T, A>(cb: (args?: A) => Promise<T>) {
  return (args: A) => {
    try {
      return cb(args);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
}
