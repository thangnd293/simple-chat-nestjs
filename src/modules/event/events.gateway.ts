import { UseGuards, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
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
import { ConversationService } from 'modules/conversation/conversation.service';
import { MessageService } from 'modules/message/message.service';
import { CreateMessageDtoSchema } from 'modules/message/dto/create-message.dto';
import { JoiWsValidationPipe } from 'pipes/joi-wsValidate.pipe';

const { secret } = jwtConfig;
const store = Store.getStore();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);
    store.set(id, socket.id);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);

    store.set(id, socket.id);
    store.remove(socket.id);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('log')
  handleLog(@ConnectedSocket() client: Socket): any {
    this.server.to(client.id).emit('log', 'test');
    return 'test';
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('send-message')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data,
  ): Promise<any> {
    const { user } = client.data;
    const { conversation: conversationId, type, content } = data;
    const conversation = await this.conversationService.getById(conversationId);

    if (!conversation) return;
    const sender = user._id;
    await this.messageService.create({
      conversation: conversationId,
      type,
      content,
      sender,
    });

    const senders = store.get(sender.toString());

    const receivers = store.get(
      conversation.members
        .find((member) => member.toString() !== sender.toString())
        .toString(),
    );

    this.server.to(Array.from(senders)).emit('send-message', data);
    this.server.to(Array.from(receivers)).emit('new-message', data);
    return 'Hello from server';
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
