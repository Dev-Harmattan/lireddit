import { MyContex } from 'src/type';
import { MiddlewareFn } from 'type-graphql';

export const isAuth: MiddlewareFn<MyContex> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('Not Authenticated');
  }
  return next();
};
