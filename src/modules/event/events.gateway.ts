import { UserService } from 'modules/user/user.service';
import { UnauthorizedException, UseGuards, UsePipes } from '@nestjs/common';
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

    if (receivers)
      this.server
        .to(Array.from(receivers))
        .emit('new-message', data, async () => {
          await this.conversationService.updateLastReceived(
            conversationId,
            receiver._id,
          );
        });

    if (senders) this.server.to(Array.from(senders)).emit('new-message', data);

    return messageCreated;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('read-message')
  async onReadMessage(@ConnectedSocket() client: Socket, @MessageBody() data) {
    console.log('data', data);

    // const { user } = client.data;
    // const { conversationId } = data;
    // const [conversation] = await Promise.all([
    //   await this.conversationService.getById(conversationId),
    //   await this.conversationService.updateLastReceived(
    //     conversationId,
    //     user._id.toString(),
    //   ),
    // ]);
    // if (!conversation) return;

    // const receiver = conversation.members.find(
    //   (member) => member.toString() !== user._id.toString(),
    // );

    // const receivers = store.get(receiver._id.toString());
    // console.log('receivers', receivers);

    // if (receivers)
    //   this.server.to(Array.from(receivers)).emit('read-message', data);
    // return true;
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
