import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HomePageContent } from './entities/home-page-content.entity'
import { UpdateHomePageContentDto } from './dto/update-home-page-content.dto'

@Injectable()
export class HomePageContentService {
  constructor(
    @InjectRepository(HomePageContent)
    private homePageContentRepository: Repository<HomePageContent>,
  ) {}

  async getContent() {
    // Get the first (and only) home page content record
    // If it doesn't exist, return default values
    let content = await this.homePageContentRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    })

    if (!content) {
      // Return default content structure
      const defaultContent = {
        heroTitle: 'Your Health, Our Priority. Compassionate Care, Always.',
        heroDescription: 'Experience dedicated and personalized healthcare. Our team of experts is here to support you on your journey to wellness.',
        heroButton1: 'Book an Appointment',
        heroButton2: 'Find a Doctor',
        doctorName: 'Dr. Evelyn Reed',
        doctorTitle: 'Lead Cardiologist, MD',
        doctorDescription: 'Dr. Evelyn Reed is a board-certified cardiologist with over 15 years of experience in diagnosing and treating a wide range of cardiovascular conditions.',
        happyPatients: '12,000+',
        yearsExperience: '15+',
        specialistDoctors: '50+',
        positiveFeedback: '98%',
        servicesTitle: 'Our Services',
        servicesDescription: 'We offer a wide range of medical services to ensure you and your family receive the best care.',
        services: [],
        whyChooseUsTitle: 'Why Choose Us?',
        whyChooseUsDescription: 'We are committed to delivering exceptional healthcare with a personal touch.',
        whyChooseUsItems: [],
        testimonialsTitle: 'What Our Patients Say',
        testimonialsDescription: 'Real stories from our valued patients.',
        testimonials: [],
        faqTitle: 'Frequently Asked Questions',
        faqDescription: 'Find answers to common questions about our services and procedures.',
        faqs: [],
        footerTagline: 'Providing quality healthcare for a better life.',
        footerAddress: '123 Health St, Wellness City, 12345',
        footerPhone: '(123) 456-7890',
        footerEmail: 'contact@healthsystem.com',
      }
      return defaultContent
    }

    return content
  }

  async updateContent(updateDto: UpdateHomePageContentDto) {
    // Get existing content or create new one
    let content = await this.homePageContentRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    })

    if (!content) {
      content = this.homePageContentRepository.create(updateDto)
    } else {
      // Update existing content
      Object.assign(content, updateDto)
    }

    const savedContent = await this.homePageContentRepository.save(content)
    return savedContent
  }
}

