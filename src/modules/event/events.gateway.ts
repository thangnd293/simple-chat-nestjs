import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnGatewayDisconnect } from '@nestjs/websockets/interfaces';
import { jwtConfig } from 'configs';
import { WsGuard } from 'guards/ws-auth.guard';
import * as jwt from 'jsonwebtoken';
import { ConversationService } from 'modules/conversation/conversation.service';
import { MessageService } from 'modules/message/message.service';
import { UserService } from 'modules/user/user.service';
import { Server, Socket } from 'socket.io';
import { Store } from 'store';
import { Payload } from 'types/jwt';

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
    private readonly userService: UserService,
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);

    store.set(id, socket.id);
    this.userService.updateOnline(id, true);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);

    store.set(id, socket.id);
    store.remove(socket.id);
    const notExist = store.get(id);

    if (!notExist) {
      this.userService.updateOnline(id, false);
      this.userService.updateLastOnline(id);
    }
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
    const messageCreated = await this.messageService.create({
      conversation: conversationId,
      type,
      content,
      sender,
    });

    const receiver = conversation.members.find(
      (member) => member.toString() !== sender.toString(),
    );

    const senders = store.get(sender.toString());
    const receivers = store.get(receiver._id.toString());

    this.server
      .to(Array.from(receivers || []))
      .to(Array.from(senders || []))
      .emit('new-message', data);

    return messageCreated;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('read-message')
  async onReadMessage(@ConnectedSocket() client: Socket, @MessageBody() data) {
    const { conversationId } = data;
    const { user } = client.data;

    const conversation = await this.conversationService.updateLastSeen(
      conversationId,
      user._id,
    );
    const sender = user._id;
    const receiver = conversation.members.find(
      (member) => member.toString() !== sender.toString(),
    );

    const receivers = store.get(receiver._id.toString());

    if (receivers)
      this.server.to(Array.from(receivers)).emit('new-message', data);
  }
}

function getUserIdFromToken(token: string): string {
  try {
    const { id } = jwt.verify(token, secret) as Payload;
    return id.toString();
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}
