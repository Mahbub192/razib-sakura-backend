import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Appointment } from './entities/appointment.entity'
import { AppointmentSlot, SlotStatus } from './entities/appointment-slot.entity'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(AppointmentSlot)
    private appointmentSlotRepository: Repository<AppointmentSlot>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Convert date string to Date object
    const appointmentDate = new Date(createAppointmentDto.date)
    
    // Find available slot
    const slot = await this.appointmentSlotRepository.findOne({
      where: {
        doctorId: createAppointmentDto.doctorId,
        date: appointmentDate,
        time: createAppointmentDto.time,
        status: SlotStatus.AVAILABLE,
      },
    })

    if (!slot) {
      throw new BadRequestException('No available slot found for the selected date and time')
    }

    // Create appointment with converted date
    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      date: appointmentDate,
    })
    const savedAppointment = await this.appointmentsRepository.save(appointment)

    // Mark slot as booked
    slot.status = SlotStatus.BOOKED
    slot.appointmentId = savedAppointment.id
    await this.appointmentSlotRepository.save(slot)

    return savedAppointment
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      relations: ['patient', 'doctor', 'clinic'],
      order: { date: 'ASC', time: 'ASC' },
    })
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'clinic'],
    })
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`)
    }
    return appointment
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { patientId },
      relations: ['doctor', 'clinic'],
      order: { date: 'ASC', time: 'ASC' },
    })
  }

  async findByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { doctorId },
      relations: ['patient', 'clinic'],
      order: { date: 'ASC', time: 'ASC' },
    })
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id)
    Object.assign(appointment, updateAppointmentDto)
    return this.appointmentsRepository.save(appointment)
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id)
    await this.appointmentsRepository.remove(appointment)
  }
}

