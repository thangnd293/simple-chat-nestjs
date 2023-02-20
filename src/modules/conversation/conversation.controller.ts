import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JoiValidationPipe } from 'pipes/joi-validate.pipe';
import { ConversationService } from './conversation.service';
import { CreateConversationSchema } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new JoiValidationPipe(CreateConversationSchema))
  @Post()
  async create(@Body() body) {
    return await this.conversationService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getConversation(@Param('id') id: string) {
    return await this.conversationService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getConversations(@Request() req) {
    const { _id } = req.user;
    return await this.conversationService.getAllByUserId(_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @Request() req) {
    const { _id } = req.user;
    return await this.conversationService.getMessagesByConversationId(
      id,
      _id.toString(),
    );
  }
}
