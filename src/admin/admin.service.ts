import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Clinic } from '../clinics/entities/clinic.entity'
import { UserRole } from '../common/enums/user-role.enum'
import { AppointmentStatus } from '../appointments/entities/appointment.entity'
import { AppointmentsService } from '../appointments/appointments.service'
import { MedicalRecordsService } from '../medical-records/medical-records.service'
import { LabResultsService } from '../lab-results/lab-results.service'
import { PrescriptionsService } from '../prescriptions/prescriptions.service'
import { MessagesService } from '../messages/messages.service'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Clinic)
    private clinicsRepository: Repository<Clinic>,
    private appointmentsService: AppointmentsService,
    private medicalRecordsService: MedicalRecordsService,
    private labResultsService: LabResultsService,
    private prescriptionsService: PrescriptionsService,
    private messagesService: MessagesService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAssistants,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      totalClinics,
      recentUsers,
      recentAppointments,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { role: UserRole.DOCTOR } }),
      this.usersRepository.count({ where: { role: UserRole.PATIENT } }),
      this.usersRepository.count({ where: { role: UserRole.ASSISTANT } }),
      this.appointmentsRepository.count(),
      this.getTodayAppointmentsCount(),
      this.appointmentsRepository.count({ where: { status: AppointmentStatus.PENDING } }),
      this.appointmentsRepository.count({ where: { status: AppointmentStatus.COMPLETED } }),
      this.clinicsRepository.count(),
      this.getRecentUsers(),
      this.getRecentAppointments(),
    ])

    // Calculate growth percentages (mock for now, can be calculated from historical data)
    const userGrowth = 12.5
    const appointmentGrowth = 8.3

    return {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAssistants,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      todayAppointments,
      totalClinics,
      userGrowth,
      appointmentGrowth,
      recentUsers,
      recentAppointments,
    }
  }

  private async getTodayAppointmentsCount() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.appointmentsRepository.count({
      where: {
        date: Between(today, tomorrow),
      },
    })
  }

  private async getRecentUsers(limit: number = 5) {
    const users = await this.usersRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'fullName', 'email', 'role', 'createdAt', 'avatar'],
    })

    return users.map((user) => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      avatar: user.avatar,
    }))
  }

  private async getRecentAppointments(limit: number = 5) {
    const appointments = await this.appointmentsRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['patient', 'doctor'],
    })

    return appointments.map((apt) => ({
      id: apt.id,
      patientName: apt.patient?.fullName || 'Unknown',
      doctorName: apt.doctor?.fullName || 'Unknown',
      date: apt.date,
      time: apt.time,
      status: apt.status,
    }))
  }

  async getAllUsers(params?: {
    role?: UserRole
    search?: string
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    const queryBuilder = this.usersRepository.createQueryBuilder('user')

    if (params?.role) {
      queryBuilder.where('user.role = :role', { role: params.role })
    }

    if (params?.search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
        { search: `%${params.search}%` },
      )
    }

    const [users, total] = await queryBuilder
      .select([
        'user.id',
        'user.fullName',
        'user.email',
        'user.phoneNumber',
        'user.role',
        'user.avatar',
        'user.isVerified',
        'user.createdAt',
        'user.specialty',
      ])
      .leftJoinAndSelect('user.clinic', 'clinic')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      users: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        specialty: user.specialty,
        clinic: user.clinic ? { id: user.clinic.id, name: user.clinic.name } : null,
        createdAt: user.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getUserDetails(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['clinic'],
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get user-specific data based on role
    let additionalData: any = {}

    if (user.role === UserRole.PATIENT) {
      const appointments = await this.appointmentsService.findByPatient(userId)
      const medicalRecords = await this.medicalRecordsService.findByPatient(userId)
      const labResults = await this.labResultsService.findByPatient(userId)
      const prescriptions = await this.prescriptionsService.findByPatient(userId)

      additionalData = {
        appointments: appointments.length,
        medicalRecords: medicalRecords.length,
        labResults: labResults.length,
        prescriptions: prescriptions.length,
      }
    } else if (user.role === UserRole.DOCTOR) {
      const appointments = await this.appointmentsService.findByDoctor(userId)
      const uniquePatients = new Set(appointments.map((apt) => apt.patientId))

      additionalData = {
        appointments: appointments.length,
        totalPatients: uniquePatients.size,
      }
    } else if (user.role === UserRole.ASSISTANT) {
      const conversations = await this.messagesService.getConversations(userId)
      additionalData = {
        conversations: conversations.length,
      }
    }

    return {
      ...user,
      additionalData,
    }
  }

  async getAllAppointments(params?: {
    status?: AppointmentStatus
    doctorId?: string
    patientId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    const queryBuilder = this.appointmentsRepository.createQueryBuilder('appointment')
    queryBuilder.leftJoinAndSelect('appointment.patient', 'patient')
    queryBuilder.leftJoinAndSelect('appointment.doctor', 'doctor')
    queryBuilder.leftJoinAndSelect('appointment.clinic', 'clinic')

    if (params?.status) {
      queryBuilder.where('appointment.status = :status', { status: params.status })
    }

    if (params?.doctorId) {
      queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId: params.doctorId })
    }

    if (params?.patientId) {
      queryBuilder.andWhere('appointment.patientId = :patientId', { patientId: params.patientId })
    }

    if (params?.startDate && params?.endDate) {
      queryBuilder.andWhere('appointment.date BETWEEN :startDate AND :endDate', {
        startDate: params.startDate,
        endDate: params.endDate,
      })
    }

    const [appointments, total] = await queryBuilder
      .orderBy('appointment.date', 'DESC')
      .addOrderBy('appointment.time', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      appointments: appointments.map((apt) => ({
        id: apt.id,
        patientName: apt.patient?.fullName || 'Unknown',
        patientId: apt.patientId,
        doctorName: apt.doctor?.fullName || 'Unknown',
        doctorId: apt.doctorId,
        clinicName: apt.clinic?.name || 'Unknown',
        date: apt.date,
        time: apt.time,
        status: apt.status,
        type: apt.type,
        reason: apt.reason,
        createdAt: apt.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getAnalytics(params?: {
    startDate?: string
    endDate?: string
  }) {
    const startDate = params?.startDate ? new Date(params.startDate) : new Date()
    startDate.setMonth(startDate.getMonth() - 1) // Default to last month
    const endDate = params?.endDate ? new Date(params.endDate) : new Date()

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAssistants,
      totalAppointments,
      appointmentsByStatus,
      appointmentsByDate,
      userGrowth,
      appointmentTrends,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { role: UserRole.DOCTOR } }),
      this.usersRepository.count({ where: { role: UserRole.PATIENT } }),
      this.usersRepository.count({ where: { role: UserRole.ASSISTANT } }),
      this.appointmentsRepository.count({
        where: {
          date: Between(startDate, endDate),
        },
      }),
      this.getAppointmentsByStatus(startDate, endDate),
      this.getAppointmentsByDate(startDate, endDate),
      this.getUserGrowth(),
      this.getAppointmentTrends(startDate, endDate),
    ])

    return {
      overview: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAssistants,
        totalAppointments,
      },
      appointmentsByStatus,
      appointmentsByDate,
      userGrowth,
      appointmentTrends,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    }
  }

  private async getAppointmentsByStatus(startDate: Date, endDate: Date) {
    const statuses = Object.values(AppointmentStatus)
    const result: Record<string, number> = {}

    for (const status of statuses) {
      const count = await this.appointmentsRepository.count({
        where: {
          status,
          date: Between(startDate, endDate),
        },
      })
      result[status] = count
    }

    return result
  }

  private async getAppointmentsByDate(startDate: Date, endDate: Date) {
    const appointments = await this.appointmentsRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      select: ['date'],
    })

    const dateMap: Record<string, number> = {}
    appointments.forEach((apt) => {
      const dateStr = new Date(apt.date).toISOString().split('T')[0]
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1
    })

    return dateMap
  }

  private async getUserGrowth() {
    // Get user counts by month for last 6 months
    const months: Array<{ month: string; count: number }> = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const count = await this.usersRepository.count({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      })

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count,
      })
    }

    return months
  }

  private async getAppointmentTrends(startDate: Date, endDate: Date) {
    // Get appointments grouped by week
    const weeks: Array<{ week: string; count: number }> = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate)
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const count = await this.appointmentsRepository.count({
        where: {
          date: Between(weekStart, weekEnd > endDate ? endDate : weekEnd),
        },
      })

      weeks.push({
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      })

      currentDate.setDate(currentDate.getDate() + 7)
    }

    return weeks
  }

  async getAllClinics(params?: {
    search?: string
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    const queryBuilder = this.clinicsRepository.createQueryBuilder('clinic')

    if (params?.search) {
      queryBuilder.where('clinic.name ILIKE :search OR clinic.address ILIKE :search', {
        search: `%${params.search}%`,
      })
    }

    const [clinics, total] = await queryBuilder
      .leftJoinAndSelect('clinic.doctors', 'doctors')
      .orderBy('clinic.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      clinics: clinics.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        description: clinic.description,
        logo: clinic.logo,
        operatingHours: clinic.operatingHours,
        totalDoctors: clinic.doctors?.length || 0,
        createdAt: clinic.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}

