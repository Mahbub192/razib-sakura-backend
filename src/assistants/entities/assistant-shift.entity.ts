import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'
import { Clinic } from '../../clinics/entities/clinic.entity'

export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('assistant_shifts')
export class AssistantShift extends BaseEntity {
  @Column()
  assistantId: string

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'time' })
  startTime: string

  @Column({ type: 'time' })
  endTime: string

  @Column()
  clinicId: string

  @Column({ type: 'simple-array', nullable: true })
  associatedResources: string[]

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.SCHEDULED,
  })
  status: ShiftStatus

  @Column({ nullable: true, type: 'text' })
  notes: string

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'assistantId' })
  assistant: User

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic
}

