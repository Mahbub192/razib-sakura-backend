import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PatientsService } from './patients.service'
import { PatientsController } from './patients.controller'
import { User } from '../users/entities/user.entity'
import { AppointmentSlot } from '../appointments/entities/appointment-slot.entity'
import { MedicalRecordsModule } from '../medical-records/medical-records.module'
import { LabResultsModule } from '../lab-results/lab-results.module'
import { PrescriptionsModule } from '../prescriptions/prescriptions.module'
import { MessagesModule } from '../messages/messages.module'
import { AppointmentsModule } from '../appointments/appointments.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AppointmentSlot]),
    MedicalRecordsModule,
    LabResultsModule,
    PrescriptionsModule,
    MessagesModule,
    AppointmentsModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}

