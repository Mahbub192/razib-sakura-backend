import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto)
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.id)
  }

  @Get('conversations/:conversationId')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.messagesService.findByConversation(conversationId)
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.messagesService.markAsRead(id)
  }
}

