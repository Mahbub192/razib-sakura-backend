import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'

export enum MedicalRecordCategory {
  DIAGNOSIS = 'diagnosis',
  MEDICATION = 'medication',
  ALLERGY = 'allergy',
  VACCINATION = 'vaccination',
  LAB_RESULT = 'lab_result',
  OTHER = 'other',
}

@Entity('medical_records')
export class MedicalRecord extends BaseEntity {
  @Column()
  patientId: string

  @Column()
  doctorId: string

  @Column({
    type: 'enum',
    enum: MedicalRecordCategory,
  })
  category: MedicalRecordCategory

  @Column()
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[]

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'patientId' })
  patient: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User
}

