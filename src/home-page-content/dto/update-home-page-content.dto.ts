import { IsOptional, IsString, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateHomePageContentDto {
  @ApiProperty({ description: 'Hero section title', example: 'Your Health, Our Priority. Compassionate Care, Always.', required: false })
  @IsOptional()
  @IsString()
  heroTitle?: string

  @ApiProperty({ description: 'Hero section description', required: false })
  @IsOptional()
  @IsString()
  heroDescription?: string

  @ApiProperty({ description: 'Hero button 1 text', example: 'Book an Appointment', required: false })
  @IsOptional()
  @IsString()
  heroButton1?: string

  @ApiProperty({ description: 'Hero button 2 text', example: 'Find a Doctor', required: false })
  @IsOptional()
  @IsString()
  heroButton2?: string

  @ApiProperty({ description: 'Doctor name', example: 'Dr. Evelyn Reed', required: false })
  @IsOptional()
  @IsString()
  doctorName?: string

  @ApiProperty({ description: 'Doctor title', example: 'Lead Cardiologist, MD', required: false })
  @IsOptional()
  @IsString()
  doctorTitle?: string

  @ApiProperty({ description: 'Doctor description', required: false })
  @IsOptional()
  @IsString()
  doctorDescription?: string

  @ApiProperty({ description: 'Happy patients count', example: '12,000+', required: false })
  @IsOptional()
  @IsString()
  happyPatients?: string

  @ApiProperty({ description: 'Years of experience', example: '15+', required: false })
  @IsOptional()
  @IsString()
  yearsExperience?: string

  @ApiProperty({ description: 'Specialist doctors count', example: '50+', required: false })
  @IsOptional()
  @IsString()
  specialistDoctors?: string

  @ApiProperty({ description: 'Positive feedback percentage', example: '98%', required: false })
  @IsOptional()
  @IsString()
  positiveFeedback?: string

  @ApiProperty({ description: 'Services section title', example: 'Our Services', required: false })
  @IsOptional()
  @IsString()
  servicesTitle?: string

  @ApiProperty({ description: 'Services section description', required: false })
  @IsOptional()
  @IsString()
  servicesDescription?: string

  @ApiProperty({ description: 'Services array', type: [Object], required: false })
  @IsOptional()
  @IsArray()
  services?: any[]

  @ApiProperty({ description: 'Why Choose Us title', example: 'Why Choose Us?', required: false })
  @IsOptional()
  @IsString()
  whyChooseUsTitle?: string

  @ApiProperty({ description: 'Why Choose Us description', required: false })
  @IsOptional()
  @IsString()
  whyChooseUsDescription?: string

  @ApiProperty({ description: 'Why Choose Us items array', type: [Object], required: false })
  @IsOptional()
  @IsArray()
  whyChooseUsItems?: any[]

  @ApiProperty({ description: 'Testimonials title', example: 'What Our Patients Say', required: false })
  @IsOptional()
  @IsString()
  testimonialsTitle?: string

  @ApiProperty({ description: 'Testimonials description', required: false })
  @IsOptional()
  @IsString()
  testimonialsDescription?: string

  @ApiProperty({ description: 'Testimonials array', type: [Object], required: false })
  @IsOptional()
  @IsArray()
  testimonials?: any[]

  @ApiProperty({ description: 'FAQ title', example: 'Frequently Asked Questions', required: false })
  @IsOptional()
  @IsString()
  faqTitle?: string

  @ApiProperty({ description: 'FAQ description', required: false })
  @IsOptional()
  @IsString()
  faqDescription?: string

  @ApiProperty({ description: 'FAQs array', type: [Object], required: false })
  @IsOptional()
  @IsArray()
  faqs?: any[]

  @ApiProperty({ description: 'Footer tagline', example: 'Providing quality healthcare for a better life.', required: false })
  @IsOptional()
  @IsString()
  footerTagline?: string

  @ApiProperty({ description: 'Footer address', example: '123 Health St, Wellness City, 12345', required: false })
  @IsOptional()
  @IsString()
  footerAddress?: string

  @ApiProperty({ description: 'Footer phone', example: '(123) 456-7890', required: false })
  @IsOptional()
  @IsString()
  footerPhone?: string

  @ApiProperty({ description: 'Footer email', example: 'contact@healthsystem.com', required: false })
  @IsOptional()
  @IsString()
  footerEmail?: string
}

