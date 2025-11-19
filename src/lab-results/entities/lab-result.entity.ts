import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'

export enum LabResultStatus {
  NORMAL = 'normal',
  BORDERLINE_HIGH = 'borderline_high',
  BORDERLINE_LOW = 'borderline_low',
  HIGH = 'high',
  LOW = 'low',
}

@Entity('lab_results')
export class LabResult extends BaseEntity {
  @Column()
  patientId: string

  @Column()
  doctorId: string

  @Column()
  testName: string

  @Column({ type: 'date' })
  testDate: Date

  @Column({ type: 'jsonb' })
  results: {
    name: string
    value: string | number
    unit: string
    status: LabResultStatus
    referenceRange: string
  }[]

  @Column({ nullable: true, type: 'text' })
  doctorNotes: string

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'patientId' })
  patient: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User
}

