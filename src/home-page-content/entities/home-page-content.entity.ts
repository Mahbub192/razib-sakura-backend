import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity('home_page_content')
export class HomePageContent extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  heroTitle: string

  @Column({ type: 'text', nullable: true })
  heroDescription: string

  @Column({ type: 'text', nullable: true })
  heroButton1: string

  @Column({ type: 'text', nullable: true })
  heroButton2: string

  @Column({ type: 'text', nullable: true })
  doctorName: string

  @Column({ type: 'text', nullable: true })
  doctorTitle: string

  @Column({ type: 'text', nullable: true })
  doctorDescription: string

  @Column({ type: 'text', nullable: true })
  happyPatients: string

  @Column({ type: 'text', nullable: true })
  yearsExperience: string

  @Column({ type: 'text', nullable: true })
  specialistDoctors: string

  @Column({ type: 'text', nullable: true })
  positiveFeedback: string

  @Column({ type: 'text', nullable: true })
  servicesTitle: string

  @Column({ type: 'text', nullable: true })
  servicesDescription: string

  @Column({ type: 'jsonb', nullable: true })
  services: any[]

  @Column({ type: 'text', nullable: true })
  whyChooseUsTitle: string

  @Column({ type: 'text', nullable: true })
  whyChooseUsDescription: string

  @Column({ type: 'jsonb', nullable: true })
  whyChooseUsItems: any[]

  @Column({ type: 'text', nullable: true })
  testimonialsTitle: string

  @Column({ type: 'text', nullable: true })
  testimonialsDescription: string

  @Column({ type: 'jsonb', nullable: true })
  testimonials: any[]

  @Column({ type: 'text', nullable: true })
  faqTitle: string

  @Column({ type: 'text', nullable: true })
  faqDescription: string

  @Column({ type: 'jsonb', nullable: true })
  faqs: any[]

  @Column({ type: 'text', nullable: true })
  footerTagline: string

  @Column({ type: 'text', nullable: true })
  footerAddress: string

  @Column({ type: 'text', nullable: true })
  footerPhone: string

  @Column({ type: 'text', nullable: true })
  footerEmail: string
}

