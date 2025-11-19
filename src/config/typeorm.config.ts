import { DataSource, DataSourceOptions } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { config } from 'dotenv'
import { join } from 'path'

// Import all entities explicitly
import { User } from '../users/entities/user.entity'
import { Clinic } from '../clinics/entities/clinic.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { AppointmentSlot } from '../appointments/entities/appointment-slot.entity'
import { MedicalRecord } from '../medical-records/entities/medical-record.entity'
import { LabResult } from '../lab-results/entities/lab-result.entity'
import { Prescription } from '../prescriptions/entities/prescription.entity'
import { Message } from '../messages/entities/message.entity'
import { Conversation } from '../messages/entities/conversation.entity'
import { AssistantShift } from '../assistants/entities/assistant-shift.entity'
import { HomePageContent } from '../home-page-content/entities/home-page-content.entity'

config()

const configService = new ConfigService()

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT') || '5433', 10),
  username: configService.get('DB_USERNAME') || 'postgres',
  password: configService.get('DB_PASSWORD') || '12345',
  database: configService.get('DB_DATABASE') || 'sakura_db',
  // Use explicit entity imports for better reliability
  entities: [
    User,
    Clinic,
    Appointment,
    AppointmentSlot,
    MedicalRecord,
    LabResult,
    Prescription,
    Message,
    Conversation,
    AssistantShift,
    HomePageContent,
  ],
  migrations: [join(__dirname, '..', '..', 'migrations', '*.{ts,js}')],
  synchronize: configService.get('NODE_ENV') === 'development', // Only in development
  logging: configService.get('NODE_ENV') === 'development',
}

export default new DataSource(typeOrmConfig)

