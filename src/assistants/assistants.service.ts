import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, In } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../common/enums/user-role.enum'
import { AssistantShift } from './entities/assistant-shift.entity'
import { CreateAssistantDto } from './dto/create-assistant.dto'
import { UpdateAssistantDto } from './dto/update-assistant.dto'
import { CreateShiftDto } from './dto/create-shift.dto'
import { UpdateShiftDto } from './dto/update-shift.dto'
import { AppointmentsService } from '../appointments/appointments.service'
import { AppointmentStatus } from '../appointments/entities/appointment.entity'
import { MedicalRecordsService } from '../medical-records/medical-records.service'
import { LabResultsService } from '../lab-results/lab-results.service'
import { PrescriptionsService } from '../prescriptions/prescriptions.service'
import { MessagesService } from '../messages/messages.service'
import { ClinicsService } from '../clinics/clinics.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AssistantsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AssistantShift)
    private shiftsRepository: Repository<AssistantShift>,
    private appointmentsService: AppointmentsService,
    private medicalRecordsService: MedicalRecordsService,
    private labResultsService: LabResultsService,
    private prescriptionsService: PrescriptionsService,
    private messagesService: MessagesService,
    private clinicsService: ClinicsService,
  ) {}

  async findAll() {
    const assistants = await this.usersRepository.find({
      where: { role: UserRole.ASSISTANT },
      select: ['id', 'email', 'phoneNumber', 'fullName', 'avatar', 'permissions', 'isVerified', 'createdAt', 'updatedAt'],
      relations: ['clinic'],
    })

    // Format for frontend
    return assistants.map((assistant) => ({
      id: assistant.id,
      name: assistant.fullName || 'Unknown',
      email: assistant.email,
      phone: assistant.phoneNumber,
      role: 'assistant',
      avatar: assistant.avatar,
      isActive: assistant.isVerified !== undefined ? assistant.isVerified : true, // Use isVerified as isActive
      clinic: assistant.clinic,
      permissions: assistant.permissions,
      createdAt: assistant.createdAt,
      updatedAt: assistant.updatedAt,
    }))
  }

  async findOne(id: string, formatForFrontend: boolean = true): Promise<any> {
    const assistant = await this.usersRepository.findOne({
      where: { id, role: UserRole.ASSISTANT },
      relations: ['clinic'],
    })
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${id} not found`)
    }

    // Return formatted for frontend or raw entity
    if (formatForFrontend) {
      return {
        id: assistant.id,
        name: assistant.fullName || 'Unknown',
        email: assistant.email,
        phone: assistant.phoneNumber,
        role: 'assistant',
        avatar: assistant.avatar,
        isActive: assistant.isVerified !== undefined ? assistant.isVerified : true, // Use isVerified as isActive
        clinic: assistant.clinic,
        permissions: assistant.permissions,
        createdAt: assistant.createdAt,
        updatedAt: assistant.updatedAt,
      }
    }

    return assistant as User
  }

  async create(createAssistantDto: CreateAssistantDto) {
    const hashedPassword = await bcrypt.hash(createAssistantDto.password, 10)
    const assistant = this.usersRepository.create({
      ...createAssistantDto,
      password: hashedPassword,
      role: UserRole.ASSISTANT,
    })
    const saved = await this.usersRepository.save(assistant)
    return this.findOne(saved.id, true) // Return formatted
  }

  async update(id: string, updateAssistantDto: UpdateAssistantDto) {
    const assistant = await this.findOne(id, false) // Get raw entity
    if (updateAssistantDto.password) {
      updateAssistantDto.password = await bcrypt.hash(updateAssistantDto.password, 10)
    }
    Object.assign(assistant, updateAssistantDto)
    const saved = await this.usersRepository.save(assistant)
    return this.findOne(saved.id, true) // Return formatted
  }

  async remove(id: string) {
    const assistant = await this.findOne(id, false) // Get raw entity
    await this.usersRepository.remove(assistant)
  }

  // Shift Management
  async getShifts(
    assistantId?: string,
    startDate?: Date,
    endDate?: Date,
    clinicLocation?: string,
  ) {
    const query = this.shiftsRepository.createQueryBuilder('shift')
      .leftJoinAndSelect('shift.assistant', 'assistant')
      .leftJoinAndSelect('shift.clinic', 'clinic')

    if (assistantId) {
      query.where('shift.assistantId = :assistantId', { assistantId })
    }

    if (startDate && endDate) {
      query.andWhere('shift.date >= :startDate', { startDate })
      query.andWhere('shift.date <= :endDate', { endDate })
    }

    if (clinicLocation) {
      query.andWhere('clinic.name = :clinicLocation OR clinic.address = :clinicLocation', {
        clinicLocation,
      })
    }

    const shifts = await query
      .orderBy('shift.date', 'ASC')
      .addOrderBy('shift.startTime', 'ASC')
      .getMany()

    // Format for frontend
    return shifts.map((shift) => ({
      id: shift.id,
      assistantId: shift.assistantId,
      assistant: shift.assistant
        ? {
            id: shift.assistant.id,
            name: shift.assistant.fullName || 'Unknown',
            email: shift.assistant.email,
            phone: shift.assistant.phoneNumber,
            avatar: shift.assistant.avatar,
          }
        : undefined,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      clinicLocation: shift.clinic?.name || shift.clinic?.address || 'Unknown Location',
      clinicId: shift.clinicId,
      clinic: shift.clinic,
      associatedResources: shift.associatedResources || [],
      status: shift.status,
      notes: shift.notes,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    }))
  }

  async createShift(createShiftDto: CreateShiftDto) {
    // If clinicLocation is provided instead of clinicId, find clinic by name/address
    let clinicId = createShiftDto.clinicId

    if (!clinicId && (createShiftDto as any).clinicLocation) {
      // This would require ClinicService - for now, we'll use clinicId
      // In a real implementation, you'd look up the clinic by name/address
    }

    const shift = this.shiftsRepository.create({
      ...createShiftDto,
      date: new Date(createShiftDto.date),
      clinicId: clinicId || createShiftDto.clinicId,
    })

    const savedShift = await this.shiftsRepository.save(shift)

    // Reload with relations for formatted response
    return this.findShiftById(savedShift.id)
  }

  async findShiftById(id: string) {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: ['assistant', 'clinic'],
    })
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`)
    }

    // Format for frontend
    return {
      id: shift.id,
      assistantId: shift.assistantId,
      assistant: shift.assistant
        ? {
            id: shift.assistant.id,
            name: shift.assistant.fullName || 'Unknown',
            email: shift.assistant.email,
            phone: shift.assistant.phoneNumber,
            avatar: shift.assistant.avatar,
          }
        : undefined,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      clinicLocation: shift.clinic?.name || shift.clinic?.address || 'Unknown Location',
      clinicId: shift.clinicId,
      clinic: shift.clinic,
      associatedResources: shift.associatedResources || [],
      status: shift.status,
      notes: shift.notes,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    }
  }

  async updateShift(id: string, updateShiftDto: UpdateShiftDto) {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: ['assistant', 'clinic'],
    })
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`)
    }

    if (updateShiftDto.date) {
      shift.date = new Date(updateShiftDto.date) as any
    }
    if (updateShiftDto.startTime) {
      shift.startTime = updateShiftDto.startTime
    }
    if (updateShiftDto.endTime) {
      shift.endTime = updateShiftDto.endTime
    }
    if (updateShiftDto.clinicId) {
      shift.clinicId = updateShiftDto.clinicId
    }
    if (updateShiftDto.associatedResources !== undefined) {
      shift.associatedResources = updateShiftDto.associatedResources
    }
    if (updateShiftDto.status) {
      shift.status = updateShiftDto.status
    }
    if (updateShiftDto.notes !== undefined) {
      shift.notes = updateShiftDto.notes
    }

    await this.shiftsRepository.save(shift)
    return this.findShiftById(id) // Return formatted
  }

  async deleteShift(id: string) {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
    })
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`)
    }
    await this.shiftsRepository.remove(shift)
  }

  // Dashboard methods
  async getDashboard(assistantId: string) {
    const assistant = await this.findOne(assistantId, false) // Get raw entity
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's appointments for the assistant's doctor
    const allAppointments = await this.appointmentsService.findAll()
    const doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    const todayAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })

    // Get weekly appointments (last 7 days)
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - 7)
    const weeklyAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= weekStart && aptDate < tomorrow
    })

    // Calculate weekly chart data
    const weeklyChart = this.calculateWeeklyChart(weeklyAppointments)

    // Format today's appointments
    const formattedTodayAppointments = todayAppointments
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 10)
      .map((apt) => ({
        id: apt.id,
        time: apt.time,
        patientName: apt.patient?.fullName || 'Unknown',
        patientInitial: apt.patient?.fullName?.charAt(0) || 'U',
        reason: apt.reason || apt.type || 'Consultation',
        status: apt.status,
        patient: apt.patient
          ? {
              id: apt.patient.id,
              name: apt.patient.fullName,
              avatar: apt.patient.avatar,
              dateOfBirth: apt.patient.dateOfBirth,
            }
          : null,
      }))

    // Calculate statistics
    const totalAppointmentsToday = todayAppointments.length
    const completedToday = todayAppointments.filter(
      (apt) => apt.status === AppointmentStatus.COMPLETED,
    ).length
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === yesterday.getTime()
    })
    const appointmentsChange = yesterdayAppointments.length
      ? ((totalAppointmentsToday - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
      : 0

    // Tasks (placeholder - in real app, this would come from a tasks table)
    const tasks = [
      { id: 1, text: 'Prepare patient files for Dr. Sharma', completed: false },
      { id: 2, text: 'Update appointment schedule', completed: true },
      { id: 3, text: 'Check inventory for medical supplies', completed: false },
      { id: 4, text: 'Follow up on pending lab results', completed: false },
    ]
    const tasksCompleted = tasks.filter((t) => t.completed).length
    const tasksTotal = tasks.length

    return {
      profile: {
        id: assistant.id,
        fullName: assistant.fullName,
        email: assistant.email,
        phoneNumber: assistant.phoneNumber,
        avatar: assistant.avatar,
        clinic: assistant.clinic,
      },
      statistics: {
        appointmentsToday: totalAppointmentsToday,
        appointmentsChange: Math.round(appointmentsChange * 10) / 10,
        tasksCompleted,
        tasksTotal,
        tasksPercentage: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
      },
      todayAppointments: formattedTodayAppointments,
      weeklyChart,
      tasks,
    }
  }

  private calculateWeeklyChart(appointments: any[]) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const chartData: { [key: string]: number } = {}

    // Initialize all days to 0
    days.forEach((day) => {
      chartData[day] = 0
    })

    // Count appointments by day
    appointments.forEach((apt) => {
      const aptDate = new Date(apt.date)
      const dayName = days[aptDate.getDay() === 0 ? 6 : aptDate.getDay() - 1] // Adjust for Monday start
      if (chartData[dayName] !== undefined) {
        chartData[dayName]++
      }
    })

    // Convert to array format
    return days.map((day) => ({
      day: day.substring(0, 3), // Mon, Tue, etc.
      count: chartData[day],
    }))
  }

  // Get appointments for assistant's doctor
  async getAppointments(assistantId: string, status?: string, filterType?: 'upcoming' | 'past' | 'all') {
    const assistant = await this.findOne(assistantId, false) // Get raw entity
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    // Get all appointments for the assistant's doctor
    const allAppointments = await this.appointmentsService.findAll()
    let doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    // Filter by status if provided
    if (status) {
      doctorAppointments = doctorAppointments.filter((apt) => apt.status === status)
    }

    // Format appointments
    const formattedAppointments = doctorAppointments.map((apt) => ({
      id: apt.id,
      patientName: apt.patient?.fullName || 'Unknown',
      date: new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: apt.time,
      assignedTo: apt.doctor?.fullName || 'Unassigned',
      type: apt.type || 'Consultation',
      status: apt.status,
      reason: apt.reason,
      notes: apt.notes,
      patient: apt.patient
        ? {
            id: apt.patient.id,
            name: apt.patient.fullName,
            email: apt.patient.email,
            phoneNumber: apt.patient.phoneNumber,
            avatar: apt.patient.avatar,
          }
        : null,
      doctor: apt.doctor
        ? {
            id: apt.doctor.id,
            name: apt.doctor.fullName,
            specialty: apt.doctor.specialty,
          }
        : null,
      clinic: apt.clinic,
    }))

    // Filter by type (upcoming/past/all)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let filtered = formattedAppointments
    if (filterType === 'upcoming') {
      filtered = formattedAppointments.filter((apt) => {
        const aptDate = new Date(apt.date)
        return aptDate >= today && (apt.status === 'confirmed' || apt.status === 'pending')
      })
    } else if (filterType === 'past') {
      filtered = formattedAppointments.filter((apt) => {
        const aptDate = new Date(apt.date)
        return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled'
      })
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }
      return a.time.localeCompare(b.time)
    })

    return filtered
  }

  // Get appointment statistics for assistant
  async getAppointmentStatistics(assistantId: string) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    const allAppointments = await this.appointmentsService.findAll()
    const doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })

    const upcomingAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= today && (apt.status === 'confirmed' || apt.status === 'pending')
    })

    const completedToday = todayAppointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length

    // Calculate week change
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const lastWeekAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= weekAgo && aptDate < today
    })
    const thisWeekAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= today && aptDate < tomorrow
    })
    const weekChange = lastWeekAppointments.length
      ? ((thisWeekAppointments.length - lastWeekAppointments.length) / lastWeekAppointments.length) * 100
      : 0

    return {
      upcomingAppointments: upcomingAppointments.length,
      completedToday,
      totalToday: todayAppointments.length,
      weekChange: Math.round(weekChange * 10) / 10,
    }
  }

  // Get patients for assistant's doctor
  async getPatients(assistantId: string, search?: string, page: number = 1, limit: number = 10) {
    const assistant = await this.findOne(assistantId, false) // Get raw entity
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    // Get all appointments for the assistant's doctor
    const allAppointments = await this.appointmentsService.findAll()
    const doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    // Get unique patient IDs from appointments
    const patientIds = [...new Set(doctorAppointments.map((apt) => apt.patientId))]

    // Get all patients
    const allPatients = await this.usersRepository.find({
      where: { role: UserRole.PATIENT },
      relations: ['clinic'],
    })

    // Filter patients who have appointments in the clinic
    let patients = allPatients.filter((patient) => patientIds.includes(patient.id))

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      patients = patients.filter(
        (patient) =>
          patient.fullName?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.phoneNumber?.toLowerCase().includes(searchLower) ||
          patient.id?.toLowerCase().includes(searchLower),
      )
    }

    // Get last appointment and diagnosis for each patient
    const patientsWithDetails = await Promise.all(
      patients.map(async (patient) => {
        const patientAppointments = doctorAppointments
          .filter((apt) => apt.patientId === patient.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        const lastAppointment = patientAppointments[0]
        const lastVisit = lastAppointment
          ? new Date(lastAppointment.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'N/A'

        // Get latest medical record for diagnosis
        const medicalRecords = await this.medicalRecordsService.findByPatient(patient.id)
        const latestRecord = medicalRecords[0]
        const diagnosis = latestRecord?.title || latestRecord?.description || 'No diagnosis'

        // Determine status based on appointments and records
        let status: 'stable' | 'monitoring' | 'discharged' | 'at-risk' = 'stable'
        if (lastAppointment) {
          if (lastAppointment.status === AppointmentStatus.COMPLETED) {
            status = 'stable'
          } else if (lastAppointment.status === AppointmentStatus.CANCELLED) {
            status = 'discharged'
          } else {
            status = 'monitoring'
          }
        }

        // Check if patient has critical conditions (check for emergency type in appointments)
        const hasEmergencyAppointment = patientAppointments.some(
          (apt) => apt.type === 'emergency' || apt.reason?.toLowerCase().includes('emergency'),
        )
        if (hasEmergencyAppointment) {
          status = 'at-risk'
        }

        return {
          id: patient.id,
          name: patient.fullName || 'Unknown',
          image: patient.avatar,
          lastVisit,
          diagnosis,
          status,
          dob: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })
            : undefined,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          gender: patient.gender,
        }
      }),
    )

    // Sort by last visit date
    patientsWithDetails.sort((a, b) => {
      const dateA = a.lastVisit === 'N/A' ? new Date(0) : new Date(a.lastVisit)
      const dateB = b.lastVisit === 'N/A' ? new Date(0) : new Date(b.lastVisit)
      return dateB.getTime() - dateA.getTime()
    })

    // Pagination
    const total = patientsWithDetails.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPatients = patientsWithDetails.slice(startIndex, endIndex)

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

  // Get patient details with history
  async getPatientDetails(assistantId: string, patientId: string) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    const patient = await this.usersRepository.findOne({
      where: { id: patientId, role: UserRole.PATIENT },
      relations: ['clinic'],
    })

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`)
    }

    // Get all appointments for the assistant's doctor
    const allAppointments = await this.appointmentsService.findAll()
    const doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId && apt.patientId === patientId)
      : []

    // Get patient history
    const [appointments, medicalRecords, labResults, prescriptions] = await Promise.all([
      Promise.resolve(doctorAppointments),
      this.medicalRecordsService.findByPatient(patientId),
      this.labResultsService.findByPatient(patientId),
      this.prescriptionsService.findByPatient(patientId),
    ])

    // Format timeline items
    const timelineItems = []

    // Add appointments to timeline
    appointments.forEach((apt) => {
      timelineItems.push({
        type: 'appointment',
        date: new Date(apt.date),
        title: `${apt.type || 'Appointment'} - ${apt.doctor?.fullName || 'Dr. Unknown'}`,
        description: apt.reason || apt.notes || 'No notes',
        diagnosis: apt.notes,
        prescription: apt.notes,
        doctor: apt.doctor?.fullName || 'Unknown',
      })
    })

    // Add medical records to timeline
    medicalRecords.forEach((record) => {
      timelineItems.push({
        type: 'note',
        date: new Date(record.date),
        title: `${record.title} - ${record.doctor?.fullName || 'Dr. Unknown'}`,
        description: record.description,
        doctor: record.doctor?.fullName || 'Unknown',
      })
    })

    // Sort by date (newest first)
    timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime())

    return {
      patient: {
        id: patient.id,
        name: patient.fullName,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        avatar: patient.avatar,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
      },
      appointments: appointments.map((apt) => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        doctor: apt.doctor?.fullName || 'Unknown',
        type: apt.type,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
      })),
      medicalRecords: medicalRecords.map((record) => ({
        id: record.id,
        title: record.title,
        description: record.description,
        date: record.date,
        category: record.category,
        doctor: record.doctor?.fullName || 'Unknown',
      })),
      labResults: labResults.map((result) => ({
        id: result.id,
        testName: result.testName,
        testDate: result.testDate,
        results: result.results,
      })),
      prescriptions: prescriptions.map((prescription) => ({
        id: prescription.id,
        medications: prescription.medications,
        prescribedDate: prescription.prescribedDate,
        status: prescription.status,
      })),
      timeline: timelineItems,
    }
  }

  // Get patient statistics
  async getPatientStatistics(assistantId: string) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    const allAppointments = await this.appointmentsService.findAll()
    const doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    const patientIds = [...new Set(doctorAppointments.map((apt) => apt.patientId))]
    const totalPatients = patientIds.length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })

    // Calculate month change
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= lastMonth && aptDate < today
    })
    const lastMonthPatientIds = [...new Set(lastMonthAppointments.map((apt) => apt.patientId))]
    const lastMonthPatients = lastMonthPatientIds.length
    const monthChange = lastMonthPatients > 0 ? ((totalPatients - lastMonthPatients) / lastMonthPatients) * 100 : 0

    return {
      totalPatients,
      appointmentsToday: todayAppointments.length,
      monthChange: Math.round(monthChange * 10) / 10,
    }
  }

  // Get appointments by date range for calendar
  async getAppointmentsByDateRange(assistantId: string, startDate: string, endDate: string) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    // Get all appointments for the assistant's doctor
    const allAppointments = await this.appointmentsService.findAll()
    let doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    // Filter by date range
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const filteredAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= start && aptDate <= end
    })

    // Format appointments for calendar
    return filteredAppointments.map((apt) => ({
      id: apt.id,
      date: apt.date,
      time: apt.time,
      patientName: apt.patient?.fullName || 'Unknown',
      patientInitial: (apt.patient?.fullName || 'Unknown').charAt(0).toUpperCase(),
      type: apt.type || 'Consultation',
      reason: apt.reason || apt.notes || '',
      status: apt.status,
      doctor: apt.doctor?.fullName || 'Unassigned',
      patient: apt.patient
        ? {
            id: apt.patient.id,
            name: apt.patient.fullName,
            email: apt.patient.email,
            phoneNumber: apt.patient.phoneNumber,
            avatar: apt.patient.avatar,
          }
        : null,
    }))
  }

  // Get today's appointments for calendar sidebar
  async getTodayAppointments(assistantId: string) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all appointments for the assistant's doctor
    const allAppointments = await this.appointmentsService.findAll()
    const doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    const todayAppointments = doctorAppointments
      .filter((apt) => {
        const aptDate = new Date(apt.date)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate.getTime() === today.getTime()
      })
      .sort((a, b) => a.time.localeCompare(b.time))

    // Format appointments
    return todayAppointments.map((apt) => ({
      id: apt.id,
      time: apt.time,
      patientName: apt.patient?.fullName || 'Unknown',
      type: apt.type || 'Consultation',
      status: apt.status,
      reason: apt.reason || apt.notes || '',
      duration: '30 min', // Default duration
      patient: apt.patient
        ? {
            id: apt.patient.id,
            name: apt.patient.fullName,
            avatar: apt.patient.avatar,
          }
        : null,
    }))
  }

  // Get reports and analytics for assistant
  async getReports(assistantId: string, startDate?: string, endDate?: string) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    const start = startDate ? new Date(startDate) : new Date()
    start.setMonth(start.getMonth() - 1) // Default to last month
    start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : new Date()
    end.setHours(23, 59, 59, 999)

    // Get all appointments for the assistant's doctor
    const allAppointments = await this.appointmentsService.findAll()
    let doctorAppointments = assistant.doctorId
      ? allAppointments.filter((apt) => apt.doctorId === assistant.doctorId)
      : []

    // Filter by date range
    const filteredAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= start && aptDate <= end
    })

    const completedAppointments = filteredAppointments.filter(
      (apt) => apt.status === AppointmentStatus.COMPLETED,
    )
    const missedCancelled = filteredAppointments.filter(
      (apt) => apt.status === AppointmentStatus.CANCELLED,
    )

    const appointmentsByStatus = filteredAppointments.reduce(
      (acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const appointmentsByType = filteredAppointments.reduce(
      (acc, apt) => {
        acc[apt.type || 'Consultation'] = (acc[apt.type || 'Consultation'] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
      const date = new Date(apt.date).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate completion rate
    const completionRate =
      filteredAppointments.length > 0
        ? parseFloat(((completedAppointments.length / filteredAppointments.length) * 100).toFixed(1))
        : 0

    // Calculate revenue (mock: $150 per completed appointment)
    const revenue = completedAppointments.length * 150
    const avgRevenuePerAppointment =
      completedAppointments.length > 0 ? revenue / completedAppointments.length : 0

    // Get previous period for comparison
    const previousStart = new Date(start)
    previousStart.setMonth(previousStart.getMonth() - 1)
    const previousEnd = new Date(start)
    previousEnd.setDate(previousEnd.getDate() - 1)
    previousEnd.setHours(23, 59, 59, 999)

    const previousAppointments = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate >= previousStart && aptDate <= previousEnd
    })

    const totalChange = previousAppointments.length > 0
      ? parseFloat(
          (((filteredAppointments.length - previousAppointments.length) / previousAppointments.length) * 100).toFixed(1),
        )
      : 0

    const completedChange = previousAppointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length
    const completedChangePercent =
      completedChange > 0
        ? parseFloat(
            (((completedAppointments.length - completedChange) / completedChange) * 100).toFixed(1),
          )
        : 0

    const missedCancelledChange = previousAppointments.filter(
      (apt) => apt.status === AppointmentStatus.CANCELLED,
    ).length
    const missedCancelledChangePercent =
      missedCancelledChange > 0
        ? parseFloat(
            (((missedCancelled.length - missedCancelledChange) / missedCancelledChange) * 100).toFixed(1),
          )
        : 0

    // Get unique patients for demographics
    const patientIds = [...new Set(filteredAppointments.map((apt) => apt.patientId).filter(Boolean))]
    const allPatients = patientIds.length > 0
      ? await this.usersRepository.find({
          where: { id: In(patientIds) },
          select: ['id', 'dateOfBirth', 'gender'],
        })
      : []

    // Calculate patient demographics
    const now = new Date()
    const ageGroups = {
      '0-18': 0,
      '19-45': 0,
      '46+': 0,
    }

    allPatients.forEach((patient) => {
      if (patient.dateOfBirth) {
        const dob = new Date(patient.dateOfBirth)
        const age = now.getFullYear() - dob.getFullYear()
        const monthDiff = now.getMonth() - dob.getMonth()
        const actualAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate()) ? age - 1 : age

        if (actualAge <= 18) {
          ageGroups['0-18']++
        } else if (actualAge <= 45) {
          ageGroups['19-45']++
        } else {
          ageGroups['46+']++
        }
      }
    })

    const totalPatients = allPatients.length
    const demographics = {
      '0-18': totalPatients > 0 ? parseFloat(((ageGroups['0-18'] / totalPatients) * 100).toFixed(1)) : 0,
      '19-45': totalPatients > 0 ? parseFloat(((ageGroups['19-45'] / totalPatients) * 100).toFixed(1)) : 0,
      '46+': totalPatients > 0 ? parseFloat(((ageGroups['46+'] / totalPatients) * 100).toFixed(1)) : 0,
    }

    return {
      keyMetrics: {
        totalAppointments: filteredAppointments.length,
        totalChange,
        completed: completedAppointments.length,
        completedChangePercent,
        completionRate,
        missedCancelled: missedCancelled.length,
        missedCancelledChangePercent,
        revenue,
        avgRevenuePerAppointment,
      },
      appointmentVolume: appointmentsByDate,
      appointmentsByStatus,
      appointmentsByType,
      patientDemographics: demographics,
    }
  }

  // Get conversations for assistant
  async getMessages(assistantId: string) {
    return this.messagesService.getConversations(assistantId)
  }

  // Get messages for a specific conversation
  async getConversationMessages(assistantId: string, conversationId: string) {
    // Verify assistant is part of the conversation
    const conversations = await this.messagesService.getConversations(assistantId)
    const conversation = conversations.find((c) => c.id === conversationId)
    
    if (!conversation) {
      throw new NotFoundException(`Conversation not found or access denied`)
    }

    return this.messagesService.findByConversation(conversationId)
  }

  // Update assistant profile
  async updateProfile(assistantId: string, updateDto: any) {
    const assistant = await this.findOne(assistantId, false)
    Object.assign(assistant, updateDto)
    return this.usersRepository.save(assistant)
  }

  // Get notification preferences
  async getNotificationPreferences(assistantId: string) {
    const assistant = await this.findOne(assistantId, false)
    return assistant.notificationPreferences || {
      events: {
        newAppointmentBooking: true,
        appointmentReminder: true,
        appointmentCancellation: true,
        newPatientMessage: true,
      },
      deliveryMethod: {
        email: true,
        sms: false,
        inApp: true,
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(assistantId: string, preferences: any) {
    const assistant = await this.findOne(assistantId, false)
    assistant.notificationPreferences = preferences
    await this.usersRepository.save(assistant)
    return preferences
  }

  // Get clinic info (assistants can view their clinic info)
  async getClinicInfo(assistantId: string) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant.clinicId) {
      return null
    }
    // Return clinic info from assistant's clinic relation
    if (assistant.clinic) {
      return assistant.clinic
    }
    // If clinic relation is not loaded, fetch it
    try {
      return await this.clinicsService.findOne(assistant.clinicId)
    } catch {
      return null
    }
  }

  // Book appointment for a patient (Assistant can book for any patient)
  async bookAppointment(assistantId: string, appointmentData: any) {
    const assistant = await this.findOne(assistantId, false)
    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${assistantId} not found`)
    }

    // Get doctor ID from assistant (assistants are associated with a doctor)
    const doctorId = assistant.doctorId || appointmentData.doctorId
    if (!doctorId) {
      throw new BadRequestException('Doctor ID is required. Assistant must be associated with a doctor.')
    }

    // Create appointment using appointments service
    // The appointments service will handle:
    // 1. Checking if patient already has appointment on that date
    // 2. Finding available slot
    // 3. Creating appointment and marking slot as booked
    const appointment = await this.appointmentsService.create({
      ...appointmentData,
      doctorId,
      status: AppointmentStatus.PENDING, // Default status for assistant-booked appointments
    })

    return appointment
  }
}

