import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppointmentsService } from './appointments.service'
import { AppointmentsController } from './appointments.controller'
import { Appointment } from './entities/appointment.entity'
import { AppointmentSlot } from './entities/appointment-slot.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, AppointmentSlot])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}

