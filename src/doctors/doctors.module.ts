import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DoctorsService } from './doctors.service'
import { DoctorsController } from './doctors.controller'
import { User } from '../users/entities/user.entity'
import { AppointmentSlot } from '../appointments/entities/appointment-slot.entity'
import { AppointmentsModule } from '../appointments/appointments.module'
import { MedicalRecordsModule } from '../medical-records/medical-records.module'
import { LabResultsModule } from '../lab-results/lab-results.module'
import { PrescriptionsModule } from '../prescriptions/prescriptions.module'
import { MessagesModule } from '../messages/messages.module'
import { ClinicsModule } from '../clinics/clinics.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AppointmentSlot]),
    AppointmentsModule,
    MedicalRecordsModule,
    LabResultsModule,
    PrescriptionsModule,
    MessagesModule,
    ClinicsModule,
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}

