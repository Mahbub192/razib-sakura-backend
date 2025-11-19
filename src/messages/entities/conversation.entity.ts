import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'
import { Message } from './message.entity'

@Entity('conversations')
export class Conversation extends BaseEntity {
  @ManyToMany(() => User)
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[]

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]

  @Column({ nullable: true })
  lastMessageId: string

  @Column({ default: 0 })
  unreadCount: number
}

