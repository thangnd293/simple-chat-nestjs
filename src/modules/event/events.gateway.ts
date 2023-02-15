import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { OnGatewayDisconnect } from '@nestjs/websockets/interfaces';
import { WsGuard } from 'guards/ws-auth.guard';
import { Server, Socket } from 'socket.io';
import { Store } from 'store';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from 'configs';
import { Payload } from 'types/jwt';

const { secret } = jwtConfig;
const store = Store.getStore();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);
    store.set(id, socket.id);
    console.log(store);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);

    store.set(id, socket.id);
    store.remove(socket.id);
    console.log(store);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('log')
  handleLog(@ConnectedSocket() client: Socket): any {
    this.server.to(client.id).emit('log', 'test');
    return 'test';
  }
}

function getUserIdFromToken(token: string): string {
  try {
    const { id } = jwt.verify(token, secret) as Payload;
    return id.toString();
  } catch (error) {
    throw new WsException('Invalid token');
  }
}
