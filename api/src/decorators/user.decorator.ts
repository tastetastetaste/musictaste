import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurUser = createParamDecorator<
  'id' | 'username' | 'contributorStatus',
  ExecutionContext
>((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();

  const user = request.user;

  return data ? user?.[data] : user;
});
