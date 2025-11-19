import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { PatientsModule } from './patients/patients.module'
import { DoctorsModule } from './doctors/doctors.module'
import { AssistantsModule } from './assistants/assistants.module'
import { AppointmentsModule } from './appointments/appointments.module'
import { MedicalRecordsModule } from './medical-records/medical-records.module'
import { LabResultsModule } from './lab-results/lab-results.module'
import { PrescriptionsModule } from './prescriptions/prescriptions.module'
import { MessagesModule } from './messages/messages.module'
import { ClinicsModule } from './clinics/clinics.module'
import { HomePageContentModule } from './home-page-content/home-page-content.module'
import { AdminModule } from './admin/admin.module'
import { typeOrmConfig } from './config/typeorm.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    AssistantsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    LabResultsModule,
    PrescriptionsModule,
    MessagesModule,
    ClinicsModule,
    HomePageContentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

