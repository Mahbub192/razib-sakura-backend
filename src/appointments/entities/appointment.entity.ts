import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'
import { Clinic } from '../../clinics/entities/clinic.entity'

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  RESCHEDULED = 'rescheduled',
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow-up',
  CHECK_UP = 'check-up',
  EMERGENCY = 'emergency',
}

@Entity('appointments')
export class Appointment extends BaseEntity {
  @Column()
  patientId: string

  @Column()
  doctorId: string

  @Column()
  clinicId: string

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'time' })
  time: string

  @Column()
  duration: number // in minutes

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.CONSULTATION,
  })
  type: AppointmentType

  @Column({ nullable: true, type: 'text' })
  reason: string

  @Column({ nullable: true, type: 'text' })
  notes: string

  // Relations
  @ManyToOne(() => User, (user) => user.patientAppointments)
  @JoinColumn({ name: 'patientId' })
  patient: User

  @ManyToOne(() => User, (user) => user.doctorAppointments)
  @JoinColumn({ name: 'doctorId' })
  doctor: User

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic
}

