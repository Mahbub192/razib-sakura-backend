import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'

export enum PrescriptionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFILL_REQUESTED = 'refill_requested',
}

@Entity('prescriptions')
export class Prescription extends BaseEntity {
  @Column()
  patientId: string

  @Column()
  doctorId: string

  @Column({ type: 'jsonb' })
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.ACTIVE,
  })
  status: PrescriptionStatus

  @Column({ type: 'date' })
  prescribedDate: Date

  @Column({ nullable: true, type: 'date' })
  expiryDate: Date

  @Column({ nullable: true })
  refillsRemaining: number

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'patientId' })
  patient: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User
}

