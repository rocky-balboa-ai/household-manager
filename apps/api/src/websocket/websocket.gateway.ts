import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private connectedUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.broadcastOnlineUsers();
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string; userName: string }) {
    this.connectedUsers.set(client.id, data.userName);
    client.join(`user:${data.userId}`);
    this.logger.log(`${data.userName} joined`);
    this.broadcastOnlineUsers();
  }

  emitTaskCreated(task: any) {
    this.server.emit('task:created', task);
  }

  emitTaskUpdated(task: any) {
    this.server.emit('task:updated', task);
  }

  emitTaskCompleted(task: any) {
    this.server.emit('task:completed', task);
  }

  emitInventoryUpdated(item: any) {
    this.server.emit('inventory:updated', item);
  }

  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  private broadcastOnlineUsers() {
    const onlineUsers = Array.from(this.connectedUsers.values());
    this.server.emit('users:online', onlineUsers);
  }
}
