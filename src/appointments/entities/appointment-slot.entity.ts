import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'
import { Clinic } from '../../clinics/entities/clinic.entity'

export enum SlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
}

@Entity('appointment_slots')
export class AppointmentSlot extends BaseEntity {
  @Column()
  doctorId: string

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'time' })
  time: string

  @Column()
  duration: number // in minutes

  @Column({ nullable: true })
  clinicId: string

  @Column({ type: 'jsonb', nullable: true })
  associatedResources: string[]

  @Column({
    type: 'enum',
    enum: SlotStatus,
    default: SlotStatus.AVAILABLE,
  })
  status: SlotStatus

  @Column({ nullable: true })
  appointmentId: string // Reference to appointment if booked

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User

  @ManyToOne(() => Clinic, { nullable: true })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic
}

