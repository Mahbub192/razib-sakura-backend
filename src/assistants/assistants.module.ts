import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssistantsService } from './assistants.service'
import { AssistantsController } from './assistants.controller'
import { User } from '../users/entities/user.entity'
import { AssistantShift } from './entities/assistant-shift.entity'
import { AppointmentsModule } from '../appointments/appointments.module'
import { MedicalRecordsModule } from '../medical-records/medical-records.module'
import { LabResultsModule } from '../lab-results/lab-results.module'
import { PrescriptionsModule } from '../prescriptions/prescriptions.module'
import { MessagesModule } from '../messages/messages.module'
import { ClinicsModule } from '../clinics/clinics.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AssistantShift]),
    AppointmentsModule,
    MedicalRecordsModule,
    LabResultsModule,
    PrescriptionsModule,
    MessagesModule,
    ClinicsModule,
  ],
  controllers: [AssistantsController],
  providers: [AssistantsService],
  exports: [AssistantsService],
})
export class AssistantsModule {}

