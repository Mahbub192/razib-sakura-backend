import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../common/enums/user-role.enum'
import { AppointmentsService } from '../appointments/appointments.service'
import { MedicalRecordsService } from '../medical-records/medical-records.service'
import { LabResultsService } from '../lab-results/lab-results.service'
import { PrescriptionsService } from '../prescriptions/prescriptions.service'
import { MessagesService } from '../messages/messages.service'
import { ClinicsService } from '../clinics/clinics.service'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'
import { CreateAppointmentSlotDto, RecurrenceType } from './dto/create-appointment-slot.dto'
import { AppointmentStatus, AppointmentType } from '../appointments/entities/appointment.entity'
import { PrescriptionStatus } from '../prescriptions/entities/prescription.entity'
import { AppointmentSlot, SlotStatus } from '../appointments/entities/appointment-slot.entity'

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AppointmentSlot)
    private appointmentSlotRepository: Repository<AppointmentSlot>,
    private appointmentsService: AppointmentsService,
    private medicalRecordsService: MedicalRecordsService,
    private labResultsService: LabResultsService,
    private prescriptionsService: PrescriptionsService,
    private messagesService: MessagesService,
    private clinicsService: ClinicsService,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      where: { role: UserRole.DOCTOR },
      select: ['id', 'email', 'phoneNumber', 'fullName', 'avatar', 'specialty', 'bio', 'yearsOfExperience', 'createdAt'],
      relations: ['clinic'],
    })
  }

  async findOne(id: string) {
    const doctor = await this.usersRepository.findOne({
      where: { id, role: UserRole.DOCTOR },
      relations: ['clinic'],
    })
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`)
    }
    return doctor
  }

  async updateProfile(doctorId: string, updateDto: UpdateDoctorProfileDto) {
    const doctor = await this.findOne(doctorId)
    Object.assign(doctor, updateDto)
    return this.usersRepository.save(doctor)
  }

  async getAppointments(doctorId: string, status?: AppointmentStatus, date?: string) {
    const appointments = await this.appointmentsService.findByDoctor(doctorId)
    let filtered = appointments

    if (status) {
      filtered = filtered.filter((apt) => apt.status === status)
    }

    if (date) {
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate >= targetDate && aptDate < nextDay
      })
    }

    return filtered
  }

  async getTodayAppointments(doctorId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return this.getAppointments(doctorId, undefined, today.toISOString())
  }

  async getUpcomingAppointments(doctorId: string) {
    const appointments = await this.getAppointments(doctorId)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointments.filter(
      (apt) =>
        new Date(apt.date) >= today &&
        (apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.PENDING),
    )
  }

  async getAppointmentsByDateRange(doctorId: string, startDate: string, endDate: string) {
    const appointments = await this.appointmentsService.findByDoctor(doctorId)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= start && aptDate <= end
    })
  }

  async updateAppointmentStatus(doctorId: string, appointmentId: string, status: AppointmentStatus) {
    const appointment = await this.appointmentsService.findOne(appointmentId)
    if (appointment.doctorId !== doctorId) {
      throw new NotFoundException('Appointment not found')
    }
    return this.appointmentsService.update(appointmentId, { status })
  }

  async confirmAppointment(doctorId: string, appointmentId: string) {
    return this.updateAppointmentStatus(doctorId, appointmentId, AppointmentStatus.CONFIRMED)
  }

  async cancelAppointment(doctorId: string, appointmentId: string) {
    return this.updateAppointmentStatus(doctorId, appointmentId, AppointmentStatus.CANCELLED)
  }

  async getPatients(doctorId: string, search?: string, page: number = 1, limit: number = 10) {
    const appointments = await this.appointmentsService.findByDoctor(doctorId)
    const uniquePatients = new Map<string, any>()

    appointments.forEach((appointment) => {
      if (appointment.patient && !uniquePatients.has(appointment.patient.id)) {
        uniquePatients.set(appointment.patient.id, {
          id: appointment.patient.id,
          name: appointment.patient.fullName,
          avatar: appointment.patient.fullName?.charAt(0) || '?',
          phone: appointment.patient.phoneNumber,
          email: appointment.patient.email,
          dob: appointment.patient.dateOfBirth,
          lastAppointment: appointment.date,
          lastVisit: new Date(appointment.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          totalAppointments: 1,
        })
      } else if (appointment.patient) {
        const patient = uniquePatients.get(appointment.patient.id)
        patient.totalAppointments += 1
        if (new Date(appointment.date) > new Date(patient.lastAppointment)) {
          patient.lastAppointment = appointment.date
          patient.lastVisit = new Date(appointment.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        }
      }
    })

    let patients = Array.from(uniquePatients.values())

    if (search) {
      const searchLower = search.toLowerCase()
      patients = patients.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.phone?.includes(search) ||
          patient.id?.toLowerCase().includes(searchLower),
      )
    }

    // Sort by last appointment date (newest first)
    patients.sort((a, b) => new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime())

    // Pagination
    const total = patients.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPatients = patients.slice(startIndex, endIndex)

    return {
      patients: paginatedPatients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getPatientDetails(doctorId: string, patientId: string) {
    const patient = await this.usersRepository.findOne({
      where: { id: patientId, role: UserRole.PATIENT },
    })
    if (!patient) {
      throw new NotFoundException('Patient not found')
    }

    const [appointments, medicalRecords, labResults, prescriptions] = await Promise.all([
      this.appointmentsService.findByDoctor(doctorId).then((apts) =>
        apts.filter((apt) => apt.patientId === patientId),
      ),
      this.medicalRecordsService.findByPatient(patientId),
      this.labResultsService.findByPatient(patientId),
      this.prescriptionsService.findByPatient(patientId),
    ])

    return {
      patient,
      appointments,
      medicalRecords,
      labResults,
      prescriptions,
    }
  }

  async getDashboardData(doctorId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get start of week (Sunday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Get end of week (Saturday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const [
      todayAppointments,
      upcomingAppointments,
      weeklyAppointments,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      unreadMessages,
      yesterdayAppointments,
    ] = await Promise.all([
      this.getTodayAppointments(doctorId).then((apts) =>
        apts.map((apt) => ({
          id: apt.id,
          time: apt.time,
          patientName: apt.patient?.fullName || 'Unknown',
          patientInitial: apt.patient?.fullName?.charAt(0) || '?',
          reason: apt.reason || apt.type,
          status: apt.status,
          patient: apt.patient,
        })),
      ),
      this.getUpcomingAppointments(doctorId).then((apts) => apts.slice(0, 5)),
      this.getAppointmentsByDateRange(doctorId, startOfWeek.toISOString(), endOfWeek.toISOString()),
      this.getPatients(doctorId).then((result) => result.pagination.total),
      this.appointmentsService.findByDoctor(doctorId).then((apts) => apts.length),
      this.getAppointments(doctorId, AppointmentStatus.PENDING).then((apts) => apts.length),
      this.getAppointments(doctorId, AppointmentStatus.COMPLETED).then((apts) => apts.length),
      this.messagesService.getConversations(doctorId).then((conversations) =>
        conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
      ),
      (() => {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return this.getAppointments(doctorId, undefined, yesterday.toISOString()).then((apts) => apts.length)
      })(),
    ])

    // Calculate weekly chart data
    const weeklyChartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + (index === 0 ? 0 : index))
      const dayAppointments = weeklyAppointments.filter((apt) => {
        const aptDate = new Date(apt.date)
        return aptDate.toDateString() === dayDate.toDateString()
      })
      return {
        day,
        count: dayAppointments.length,
      }
    })

    // Calculate patient growth (mock for now)
    const patientGrowth = 1.5 // This would come from historical data

    // Calculate appointment change vs yesterday
    const appointmentChange = todayAppointments.length - yesterdayAppointments
    const appointmentChangePercent = yesterdayAppointments > 0
      ? parseFloat(((appointmentChange / yesterdayAppointments) * 100).toFixed(1))
      : 0

    return {
      todayAppointments,
      upcomingAppointments,
      weeklyChartData,
      statistics: {
        totalPatients,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        unreadMessages,
        appointmentsToday: todayAppointments.length,
        patientGrowth,
        appointmentChangePercent,
      },
    }
  }

  async getReports(doctorId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date()
    start.setMonth(start.getMonth() - 1) // Default to last month
    start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : new Date()
    end.setHours(23, 59, 59, 999)

    const [appointments, allPatients] = await Promise.all([
      this.getAppointmentsByDateRange(doctorId, start.toISOString(), end.toISOString()),
      this.getPatients(doctorId),
    ])

    const completedAppointments = appointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED)
    const missedCancelled = appointments.filter(
      (apt) => apt.status === AppointmentStatus.CANCELLED,
    )

    const appointmentsByStatus = appointments.reduce(
      (acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const appointmentsByType = appointments.reduce(
      (acc, apt) => {
        acc[apt.type] = (acc[apt.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const appointmentsByDate = appointments.reduce((acc, apt) => {
      const date = new Date(apt.date).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate completion rate
    const completionRate = appointments.length > 0
      ? parseFloat(((completedAppointments.length / appointments.length) * 100).toFixed(1))
      : 0

    // Calculate revenue (mock: $150 per completed appointment)
    const revenue = completedAppointments.length * 150
    const avgRevenuePerAppointment = completedAppointments.length > 0 ? revenue / completedAppointments.length : 0

    // Get previous period for comparison
    const previousStart = new Date(start)
    previousStart.setMonth(previousStart.getMonth() - 1)
    const previousEnd = new Date(start)
    previousEnd.setDate(previousEnd.getDate() - 1)
    const previousAppointments = await this.getAppointmentsByDateRange(
      doctorId,
      previousStart.toISOString(),
      previousEnd.toISOString(),
    )

    const appointmentChange = appointments.length - previousAppointments.length
    const appointmentChangePercent = previousAppointments.length > 0
      ? parseFloat(((appointmentChange / previousAppointments.length) * 100).toFixed(1))
      : 0

    // Patient demographics - calculate from actual patient data
    const patientDemographics = {
      '0-18': 0,
      '19-45': 0,
      '46+': 0,
    }

    // Calculate demographics from patient data
    if (allPatients && allPatients.patients) {
      const now = new Date()
      allPatients.patients.forEach((patient: any) => {
        if (patient.dob) {
          const birthDate = new Date(patient.dob)
          const age = now.getFullYear() - birthDate.getFullYear()
          const monthDiff = now.getMonth() - birthDate.getMonth()
          const actualAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate()) ? age - 1 : age

          if (actualAge >= 0 && actualAge <= 18) {
            patientDemographics['0-18']++
          } else if (actualAge >= 19 && actualAge <= 45) {
            patientDemographics['19-45']++
          } else if (actualAge >= 46) {
            patientDemographics['46+']++
          }
        }
      })
    }

    // If no patient data, use default percentages based on total patients
    const totalDemographics = patientDemographics['0-18'] + patientDemographics['19-45'] + patientDemographics['46+']
    if (totalDemographics === 0 && allPatients && allPatients.patients) {
      const totalPatients = allPatients.patients.length
      if (totalPatients > 0) {
        patientDemographics['0-18'] = Math.round(totalPatients * 0.15)
        patientDemographics['19-45'] = Math.round(totalPatients * 0.45)
        patientDemographics['46+'] = totalPatients - patientDemographics['0-18'] - patientDemographics['19-45']
      }
    }

    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      keyMetrics: {
        totalAppointments: appointments.length,
        completed: completedAppointments.length,
        missedCancelled: missedCancelled.length,
        revenue,
        completionRate,
        avgRevenuePerAppointment,
        appointmentChangePercent,
      },
      appointmentsByStatus,
      appointmentsByType,
      appointmentsByDate,
      patientDemographics,
    }
  }

  async getMessages(doctorId: string) {
    return this.messagesService.getConversations(doctorId)
  }

  async createAppointmentSlot(doctorId: string, slotData: CreateAppointmentSlotDto) {
    const { date, startTime, endTime, slotDuration, clinicId, associatedResources, recurrence } = slotData

    // Generate slots based on time range and duration
    const slots = this.generateTimeSlots(date, startTime, endTime, slotDuration)

    // If recurrence is set, generate slots for recurring dates
    let allSlots: Array<{ date: string; time: string }> = [...slots]
    if (recurrence) {
      const recurringSlots = this.generateRecurringSlots(
        date,
        startTime,
        endTime,
        slotDuration,
        recurrence,
        slotData.recurrenceEndDate,
      )
      allSlots = [...allSlots, ...recurringSlots]
    }

    // Save slots to database
    const savedSlots = await Promise.all(
      allSlots.map((slot) =>
        this.appointmentSlotRepository.save({
          doctorId,
          date: new Date(slot.date),
          time: slot.time,
          duration: slotDuration,
          clinicId: clinicId || null,
          associatedResources: associatedResources || [],
          status: SlotStatus.AVAILABLE,
        }),
      ),
    )

    return {
      message: `Successfully created ${savedSlots.length} appointment slots`,
      slots: savedSlots,
      totalSlots: savedSlots.length,
    }
  }

  private generateTimeSlots(date: string, startTime: string, endTime: string, duration: number) {
    const slots: Array<{ date: string; time: string }> = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
      slots.push({ date, time: timeStr })

      // Add duration
      currentMin += duration
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    return slots
  }

  private generateRecurringSlots(
    startDate: string,
    startTime: string,
    endTime: string,
    duration: number,
    recurrence: RecurrenceType,
    endDate?: number,
  ) {
    const slots: Array<{ date: string; time: string }> = []
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

    let currentDate = new Date(start)
    currentDate.setDate(currentDate.getDate() + 1) // Start from next occurrence

    while (currentDate <= end) {
      let shouldInclude = false

      if (recurrence === RecurrenceType.DAILY) {
        shouldInclude = true
        currentDate.setDate(currentDate.getDate() + 1)
      } else if (recurrence === RecurrenceType.WEEKLY) {
        shouldInclude = currentDate.getDay() === start.getDay()
        currentDate.setDate(currentDate.getDate() + 1)
      } else if (recurrence === RecurrenceType.MONTHLY) {
        shouldInclude = currentDate.getDate() === start.getDate()
        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      if (shouldInclude) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const daySlots = this.generateTimeSlots(dateStr, startTime, endTime, duration)
        slots.push(...daySlots)
      }
    }

    return slots
  }

  async getNotificationPreferences(doctorId: string) {
    const doctor = await this.findOne(doctorId)
    return (
      doctor.notificationPreferences || {
        events: {
          newAppointment: true,
          appointmentReminder: true,
          appointmentCancellation: true,
          newMessage: false,
        },
        deliveryMethods: {
          email: true,
          sms: false,
          push: true,
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      }
    )
  }

  async updateNotificationPreferences(doctorId: string, preferences: any) {
    const doctor = await this.findOne(doctorId)
    doctor.notificationPreferences = preferences
    return this.usersRepository.save(doctor)
  }

  async getClinicInfo(doctorId: string) {
    const doctor = await this.findOne(doctorId)
    if (!doctor.clinicId) {
      return null
    }
    return this.clinicsService.findOne(doctor.clinicId)
  }

  async updateClinicInfo(doctorId: string, clinicData: any) {
    const doctor = await this.findOne(doctorId)
    if (!doctor.clinicId) {
      // Create new clinic if doctor doesn't have one
      // Set default operating hours if not provided
      const clinicDataWithDefaults = {
        ...clinicData,
        operatingHours: clinicData.operatingHours || {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '09:00', close: '13:00' },
          sunday: { closed: true },
        },
      }
      const clinic = await this.clinicsService.create(clinicDataWithDefaults)
      doctor.clinicId = clinic.id
      await this.usersRepository.save(doctor)
      return clinic
    }
    return this.clinicsService.update(doctor.clinicId, clinicData)
  }

  async getAppointmentSlots(doctorId: string, startDate?: string, endDate?: string) {
    const queryBuilder = this.appointmentSlotRepository
      .createQueryBuilder('slot')
      .where('slot.doctorId = :doctorId', { doctorId })
      .andWhere('slot.status = :status', { status: SlotStatus.AVAILABLE })

    if (startDate && endDate) {
      queryBuilder.andWhere('slot.date >= :startDate', { startDate })
      queryBuilder.andWhere('slot.date <= :endDate', { endDate })
    }

    const slots = await queryBuilder.orderBy('slot.date', 'ASC').addOrderBy('slot.time', 'ASC').getMany()

    // Group slots by date
    const slotsByDate: Record<string, any[]> = {}
    slots.forEach((slot) => {
      const dateStr = new Date(slot.date).toISOString().split('T')[0]
      if (!slotsByDate[dateStr]) {
        slotsByDate[dateStr] = []
      }
      slotsByDate[dateStr].push({
        id: slot.id,
        time: slot.time,
        duration: slot.duration,
        status: slot.status,
        clinicId: slot.clinicId,
        associatedResources: slot.associatedResources,
      })
    })

    // Format response
    return Object.entries(slotsByDate).map(([date, slotList]) => ({
      date,
      slots: slotList,
      totalSlots: slotList.length,
      availableSlots: slotList.length,
    }))
  }

  async createMedicalRecord(doctorId: string, patientId: string, recordData: any) {
    return this.medicalRecordsService.create({
      ...recordData,
      patientId,
      doctorId,
    })
  }

  async createLabResult(doctorId: string, patientId: string, labData: any) {
    return this.labResultsService.create({
      ...labData,
      patientId,
      doctorId,
    })
  }

  async createPrescription(doctorId: string, patientId: string, prescriptionData: any) {
    return this.prescriptionsService.create({
      ...prescriptionData,
      patientId,
      doctorId,
      status: PrescriptionStatus.ACTIVE,
    })
  }
}

