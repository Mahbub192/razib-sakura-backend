import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'
import { Conversation } from './conversation.entity'

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  conversationId: string

  @Column()
  senderId: string

  @Column()
  receiverId: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[]

  @Column({ default: false })
  read: boolean

  // Relations
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User
}

