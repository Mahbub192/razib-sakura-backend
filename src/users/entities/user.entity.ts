import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { UserRole } from '../../common/enums/user-role.enum'
import { Appointment } from '../../appointments/entities/appointment.entity'
import { Clinic } from '../../clinics/entities/clinic.entity'

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  phoneNumber: string

  @Column()
  fullName: string

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole

  @Column({ nullable: true })
  avatar: string

  @Column({ select: false })
  password: string

  @Column({ default: false })
  isVerified: boolean

  @Column({ nullable: true })
  dateOfBirth: Date

  @Column({ nullable: true })
  gender: string

  @Column({ nullable: true, type: 'text' })
  address: string

  @Column({ nullable: true, type: 'jsonb' })
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }

  // Doctor specific fields
  @Column({ nullable: true })
  specialty: string

  @Column({ nullable: true })
  licenseNumber: string

  @Column({ nullable: true, type: 'text' })
  bio: string

  @Column({ nullable: true })
  yearsOfExperience: number

  // Assistant specific fields
  @Column({ type: 'simple-array', nullable: true })
  permissions: string[]

  // Notification preferences
  @Column({ type: 'jsonb', nullable: true })
  notificationPreferences: {
    events: {
      newAppointment: boolean
      appointmentReminder: boolean
      appointmentCancellation: boolean
      newMessage: boolean
    }
    deliveryMethods: {
      email: boolean
      sms: boolean
      push: boolean
    }
    quietHours: {
      enabled: boolean
      startTime: string
      endTime: string
    }
  }

  // Relations
  @ManyToOne(() => Clinic, (clinic) => clinic.doctors, { nullable: true })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic

  @Column({ nullable: true })
  clinicId: string

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  patientAppointments: Appointment[]

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[]
}

