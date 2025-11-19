import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'

@Entity('clinics')
export class Clinic extends BaseEntity {
  @Column()
  name: string

  @Column({ type: 'text' })
  address: string

  @Column()
  phone: string

  @Column()
  email: string

  @Column({ nullable: true })
  logo: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'jsonb', nullable: true })
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }

  @OneToMany(() => User, (user) => user.clinic)
  doctors: User[]
}

