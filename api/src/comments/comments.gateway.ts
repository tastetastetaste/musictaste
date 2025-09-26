import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IComment } from 'shared';
import { getCorsConfig } from '../common/cors.config';

@WebSocketGateway({
  cors: getCorsConfig(),
})
export class CommentsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-comment-room')
  handleJoinRoom(client: Socket, entity: string) {
    client.join(entity);
  }

  @SubscribeMessage('leave-comment-room')
  handleLeaveRoom(client: Socket, entity: string) {
    client.leave(entity);
  }

  async broadcastNewComment(comment: IComment) {
    const entity = `${comment.entityType}:${comment.entityId}`;
    this.server.to(entity).emit('new-comment', comment);
  }
}
