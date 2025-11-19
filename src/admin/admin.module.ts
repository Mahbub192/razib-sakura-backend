import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { User } from '../users/entities/user.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Clinic } from '../clinics/entities/clinic.entity'
import { MedicalRecord } from '../medical-records/entities/medical-record.entity'
import { LabResult } from '../lab-results/entities/lab-result.entity'
import { Prescription } from '../prescriptions/entities/prescription.entity'
import { UsersModule } from '../users/users.module'
import { AppointmentsModule } from '../appointments/appointments.module'
import { ClinicsModule } from '../clinics/clinics.module'
import { MedicalRecordsModule } from '../medical-records/medical-records.module'
import { LabResultsModule } from '../lab-results/lab-results.module'
import { PrescriptionsModule } from '../prescriptions/prescriptions.module'
import { MessagesModule } from '../messages/messages.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Appointment, Clinic]),
    UsersModule,
    AppointmentsModule,
    ClinicsModule,
    MedicalRecordsModule,
    LabResultsModule,
    PrescriptionsModule,
    MessagesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

