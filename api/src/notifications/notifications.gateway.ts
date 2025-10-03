import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getCorsConfig } from '../common/cors.config';
import { INotification } from 'shared';

@WebSocketGateway({
  cors: getCorsConfig(),
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-notifications-room')
  handleJoinRoom(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }

  @SubscribeMessage('leave-notifications-room')
  handleLeaveRoom(client: Socket, userId: string) {
    client.leave(`user:${userId}`);
  }

  async sendNotificationToUser(userId: string, notification: INotification) {
    this.server.to(`user:${userId}`).emit('new-notification', notification);
  }
}
