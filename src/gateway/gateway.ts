import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IUserService } from 'src/users/interfaces/User';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Services } from '../utils/constants';
import { IGatewaySessionManager } from './gateway.session';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    readonly sessions: IGatewaySessionManager,
    @Inject(Services.USERS)
    readonly usersService: IUserService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: AuthenticatedSocket) {
    console.log('Incoming Connection');
    console.log(`${socket.user.username} connected.`);
    this.sessions.setUserSocket(socket.user.id, socket);
    socket.emit('connected', {});
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log('handleDisconnect');
    console.log(`${socket.user.username} disconnected.`);
    this.sessions.removeUserSocket(socket.user.id);
  }

  @SubscribeMessage('onWorkspaceJoin')
  onGroupJoin(
    @MessageBody() workspaceId: number,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onWorkspaceJoin');
    client.join(`/workspace/${workspaceId}`);
  }

  @SubscribeMessage('onWorkspaceLeave')
  onGroupLeave(
    @MessageBody() workspaceId: number,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onWorkspaceLeave');
    client.leave(`/workspace/${workspaceId}`);
  }

  @OnEvent('notification.Change')
  async handleNotifications(user: any) {
    const recipientSocket = this.sessions.getUserSocket(user.userId);
    if (recipientSocket) recipientSocket.emit('onNotification');
  }

  @OnEvent('workspaceUser.get')
  async handleUserRemoveFromWorkspace(payload: any, workspace: any) {
    console.log('inside workspace.user.leave');
    const ROOM_NAME = `/workspace/${workspace.workspaceId}`;
    const { rooms } = this.server.sockets.adapter;
    console.log(rooms, ' rooms of server');
    const socketsInRoom = rooms.get(ROOM_NAME);
    console.log(socketsInRoom, ' sockets it room ');
    this.server.to(ROOM_NAME).emit('onRemoveWorkspaceUser', payload);
  }

  @OnEvent('workspaceTickets.add')
  async handleAddTicketWorkspace(payload: any, workspace: any) {
    console.log('inside workspace.tickets.add');
    const ROOM_NAME = `/workspace/${workspace.id}`;
    const { rooms } = this.server.sockets.adapter;
    console.log(rooms, ' rooms of server');
    const socketsInRoom = rooms.get(ROOM_NAME);
    console.log(socketsInRoom, ' sockets it room ');
    this.server.to(ROOM_NAME).emit('onAddTicket', payload);
  }

  @OnEvent('userWorkspaces.get')
  async handleUserWorkspaces(user: any) {
    const recipientSocket = this.sessions.getUserSocket(user.userId);
    if (recipientSocket) recipientSocket.emit('onGetUserWorkspaces');
  }
}
