import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from './entities/message.entity'
import { Conversation } from './entities/conversation.entity'
import { CreateMessageDto } from './dto/create-message.dto'

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    // Find or create conversation
    let conversation = await this.findOrCreateConversation(
      createMessageDto.senderId,
      createMessageDto.receiverId,
    )

    const message = this.messagesRepository.create({
      ...createMessageDto,
      conversationId: conversation.id,
    })

    const savedMessage = await this.messagesRepository.save(message)

    // Update conversation
    conversation.lastMessageId = savedMessage.id
    conversation.unreadCount += 1
    await this.conversationsRepository.save(conversation)

    return savedMessage
  }

  async findOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'p1', 'p1.id = :userId1', { userId1 })
      .innerJoin('conversation.participants', 'p2', 'p2.id = :userId2', { userId2 })
      .getOne()

    if (conversation) {
      return conversation
    }

    // Create new conversation
    const newConversation = this.conversationsRepository.create()
    newConversation.participants = [
      { id: userId1 } as any,
      { id: userId2 } as any,
    ]
    return this.conversationsRepository.save(newConversation)
  }

  async findByConversation(conversationId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversationId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    })
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany()
  }

  async markAsRead(messageId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({ where: { id: messageId } })
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`)
    }
    message.read = true
    return this.messagesRepository.save(message)
  }
}

