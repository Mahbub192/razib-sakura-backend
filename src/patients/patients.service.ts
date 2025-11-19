import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../common/enums/user-role.enum'
import { MedicalRecordsService } from '../medical-records/medical-records.service'
import { LabResultsService } from '../lab-results/lab-results.service'
import { PrescriptionsService } from '../prescriptions/prescriptions.service'
import { MessagesService } from '../messages/messages.service'
import { AppointmentsService } from '../appointments/appointments.service'
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto'
import { AppointmentStatus } from '../appointments/entities/appointment.entity'
import { PrescriptionStatus } from '../prescriptions/entities/prescription.entity'
import { AppointmentSlot, SlotStatus } from '../appointments/entities/appointment-slot.entity'

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AppointmentSlot)
    private appointmentSlotRepository: Repository<AppointmentSlot>,
    private medicalRecordsService: MedicalRecordsService,
    private labResultsService: LabResultsService,
    private prescriptionsService: PrescriptionsService,
    private messagesService: MessagesService,
    private appointmentsService: AppointmentsService,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      where: { role: UserRole.PATIENT },
      select: ['id', 'email', 'phoneNumber', 'fullName', 'avatar', 'dateOfBirth', 'gender', 'createdAt'],
    })
  }

  async findOne(id: string) {
    const patient = await this.usersRepository.findOne({
      where: { id, role: UserRole.PATIENT },
      relations: ['clinic'],
    })
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`)
    }
    return patient
  }

  async updateProfile(patientId: string, updateDto: UpdatePatientProfileDto) {
    const patient = await this.findOne(patientId)
    Object.assign(patient, updateDto)
    return this.usersRepository.save(patient)
  }

  async getAppointments(patientId: string, status?: AppointmentStatus) {
    const appointments = await this.appointmentsService.findByPatient(patientId)
    let filtered = appointments

    if (status) {
      filtered = filtered.filter((apt) => apt.status === status)
    }

    // Format appointments for frontend
    return filtered.map((apt) => {
      const date = new Date(apt.date)
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const formattedTime = apt.time

      return {
        id: apt.id,
        doctorId: apt.doctorId,
        doctorName: apt.doctor?.fullName || 'Unknown Doctor',
        doctorInitial: apt.doctor?.fullName?.charAt(0) || '?',
        specialty: apt.doctor?.specialty || '',
        clinicName: apt.clinic?.name || '',
        date: apt.date,
        formattedDate,
        time: formattedTime,
        formattedDateTime: `${formattedDate} at ${formattedTime}`,
        status: apt.status,
        reason: apt.reason || apt.type,
        type: apt.type,
      }
    })
  }

  async getUpcomingAppointments(patientId: string) {
    const appointments = await this.appointmentsService.findByPatient(patientId)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcoming = appointments.filter(
      (apt) =>
        new Date(apt.date) >= today &&
        (apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.PENDING),
    )
    
    // Format for frontend
    return upcoming.map((apt) => {
      const date = new Date(apt.date)
      const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      const day = date.getDate()
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })

      return {
        ...apt,
        month,
        day,
        weekday,
        doctorName: apt.doctor?.fullName || 'Unknown Doctor',
        doctorInitial: apt.doctor?.fullName?.charAt(0) || '?',
        specialty: apt.doctor?.specialty || '',
        clinicName: apt.clinic?.name || '',
      }
    })
  }

  async getMedicalRecords(patientId: string, category?: string, page: number = 1, limit: number = 10) {
    const records = await this.medicalRecordsService.findByPatient(patientId)
    let filtered = records

    // Map category names from frontend to enum values
    const categoryMap: Record<string, string> = {
      'All Records': 'all',
      'Diagnoses': 'diagnosis',
      'Medications': 'medication',
      'Allergies': 'allergy',
      'Vaccinations': 'vaccination',
      'Lab Results': 'lab_result',
    }

    const mappedCategory = categoryMap[category || ''] || category

    if (mappedCategory && mappedCategory !== 'all') {
      filtered = filtered.filter((record) => record.category === mappedCategory)
    }

    // Format records for frontend
    const formattedRecords = filtered.map((record) => {
      const date = new Date(record.date)
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      // Map category to display name
      const categoryDisplayMap: Record<string, string> = {
        diagnosis: 'Diagnosis',
        medication: 'Medication',
        allergy: 'Allergy',
        vaccination: 'Vaccination',
        lab_result: 'Lab Result',
        other: 'Other',
      }

      // Determine status based on category
      let status = 'Active'
      if (record.category === 'diagnosis') {
        status = 'Resolved'
      } else if (record.category === 'allergy') {
        status = 'Confirmed'
      } else if (record.category === 'medication') {
        status = 'Active'
      }

      return {
        id: record.id,
        title: record.title,
        category: record.category,
        categoryDisplay: categoryDisplayMap[record.category] || 'Other',
        description: record.description,
        date: record.date,
        formattedDate,
        providerName: record.doctor?.fullName || 'Unknown Provider',
        status,
        attachments: record.attachments || [],
      }
    })

    // Pagination
    const total = formattedRecords.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecords = formattedRecords.slice(startIndex, endIndex)

    return {
      records: paginatedRecords,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getLabResults(patientId: string, testType?: string, startDate?: string, endDate?: string) {
    let results = await this.labResultsService.findByPatient(patientId)

    // Filter by test type if provided
    if (testType && testType !== 'All Test Types') {
      results = results.filter((result) => {
        const typeLower = testType.toLowerCase()
        return result.testName.toLowerCase().includes(typeLower)
      })
    }

    // Filter by date range if provided
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      results = results.filter((result) => new Date(result.testDate) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      results = results.filter((result) => new Date(result.testDate) <= end)
    }

    // Format results for frontend table
    const formattedResults = results.flatMap((result) => {
      const testDate = new Date(result.testDate)
      const formattedDate = testDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      // If result has multiple test items, create a row for each
      if (result.results && result.results.length > 0) {
        return result.results.map((item, index) => ({
          id: `${result.id}-${index}`,
          testName: index === 0 ? result.testName : '', // Show test name only for first row
          testDate: formattedDate,
          result: typeof item.value === 'number' ? `${item.value} ${item.unit}` : item.value,
          value: item.value,
          unit: item.unit,
          referenceRange: item.referenceRange,
          status: item.status,
          statusDisplay: item.status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          labResultId: result.id,
          doctorNotes: index === 0 ? result.doctorNotes : null, // Show notes only for first row
          doctorName: result.doctor?.fullName || 'Unknown Doctor',
        }))
      }

      // Single result row
      return [
        {
          id: result.id,
          testName: result.testName,
          testDate: formattedDate,
          result: 'See Details',
          referenceRange: 'Varies by component',
          status: result.results?.[0]?.status || 'normal',
          statusDisplay: 'Normal',
          labResultId: result.id,
          doctorNotes: result.doctorNotes,
          doctorName: result.doctor?.fullName || 'Unknown Doctor',
        },
      ]
    })

    // Get latest doctor notes (from most recent result)
    const latestResult = results[0] // Results are already sorted by date DESC
    const doctorNotes = latestResult?.doctorNotes || null
    const doctorName = latestResult?.doctor?.fullName || null
    const notesDate = latestResult?.testDate || null

    return {
      results: formattedResults,
      doctorNotes: doctorNotes
        ? {
            date: notesDate,
            formattedDate: notesDate
              ? new Date(notesDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '',
            doctorName,
            content: doctorNotes,
          }
        : null,
    }
  }

  async getPrescriptions(patientId: string, status?: PrescriptionStatus) {
    const prescriptions = await this.prescriptionsService.findByPatient(patientId)
    let filtered = prescriptions

    if (status) {
      filtered = filtered.filter((prescription) => prescription.status === status)
    }

    // Format prescriptions for frontend
    return filtered.map((prescription) => {
      const medication = prescription.medications?.[0] || {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      }
      const prescribedDate = new Date(prescription.prescribedDate)
      const formattedDate = prescribedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      return {
        id: prescription.id,
        medicationName: medication.name || 'Unknown Medication',
        dosage: medication.dosage || '',
        frequency: medication.frequency || '',
        duration: medication.duration || '',
        instructions: medication.instructions || '',
        status: prescription.status,
        statusDisplay: prescription.status
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        prescribedDate: prescription.prescribedDate,
        formattedDate,
        expiryDate: prescription.expiryDate,
        refillsRemaining: prescription.refillsRemaining || 0,
        hasRefills: (prescription.refillsRemaining || 0) > 0,
        doctorName: prescription.doctor?.fullName || 'Unknown Doctor',
        doctorSpecialty: prescription.doctor?.specialty || '',
        medications: prescription.medications, // Keep original for reference
      }
    })
  }

  async getActivePrescriptions(patientId: string) {
    return this.getPrescriptions(patientId, PrescriptionStatus.ACTIVE)
  }

  async getMessages(patientId: string, conversationId?: string) {
    const conversations = await this.messagesService.getConversations(patientId)

    // Format conversations for frontend
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants?.find((p) => p.id !== patientId)
      const lastMessage = conv.messages?.[conv.messages.length - 1]
      const lastMessageDate = lastMessage?.createdAt
        ? new Date(lastMessage.createdAt)
        : new Date(conv.updatedAt)

      // Format time display
      let timeDisplay = ''
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        timeDisplay = lastMessageDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      } else if (diffDays === 1) {
        timeDisplay = 'Yesterday'
      } else if (diffDays < 7) {
        timeDisplay = lastMessageDate.toLocaleDateString('en-US', { weekday: 'short' })
      } else {
        timeDisplay = lastMessageDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      }

      return {
        id: conv.id,
        name: otherParticipant?.fullName || 'Unknown',
        avatar: otherParticipant?.fullName?.charAt(0) || '?',
        lastMessage: lastMessage?.content || 'No messages',
        snippet: lastMessage?.content?.substring(0, 50) + '...' || '',
        time: timeDisplay,
        unread: conv.unreadCount > 0,
        unreadCount: conv.unreadCount,
        online: false, // This would come from a presence service
      }
    })

    // If conversationId is provided, get messages for that conversation
    if (conversationId) {
      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation) {
        const messages = await this.messagesService.findByConversation(conversationId)
        const formattedMessages = messages.map((msg) => {
          const msgDate = new Date(msg.createdAt)
          return {
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.sender?.fullName || 'Unknown',
            senderInitial: msg.sender?.fullName?.charAt(0) || '?',
            receiverId: msg.receiverId,
            content: msg.content,
            read: msg.read,
            createdAt: msg.createdAt,
            formattedTime: msgDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
            formattedDate: msgDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            isPatient: msg.senderId === patientId,
          }
        })

        return {
          conversations: formattedConversations,
          currentConversation: {
            id: conversation.id,
            participants: conversation.participants,
            messages: formattedMessages,
          },
        }
      }
    }

    return {
      conversations: formattedConversations,
    }
  }

  async getDashboardData(patientId: string) {
    const [patient, upcomingAppointments, recentLabResults, activePrescriptions, conversations] = await Promise.all([
      this.findOne(patientId),
      this.getUpcomingAppointments(patientId),
      this.labResultsService.findByPatient(patientId).then((results) => results.slice(0, 3)),
      this.getActivePrescriptions(patientId),
      this.messagesService.getConversations(patientId),
    ])

    // Format upcoming appointments for frontend
    const formattedAppointments = upcomingAppointments.slice(0, 5).map((apt) => {
      const date = new Date(apt.date)
      const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      const day = date.getDate()
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
      const time = apt.time

      return {
        id: apt.id,
        doctorId: apt.doctorId,
        date: apt.date,
        month,
        day,
        weekday,
        time,
        doctorName: apt.doctor?.fullName || 'Unknown Doctor',
        doctorInitial: apt.doctor?.fullName?.charAt(0) || '?',
        specialty: apt.doctor?.specialty || '',
        clinicName: apt.clinic?.name || '',
        reason: apt.reason || apt.type,
        status: apt.status,
      }
    })

    // Format secure messages for frontend
    const formattedMessages = conversations.slice(0, 3).map((conv) => {
      const otherParticipant = conv.participants?.find((p) => p.id !== patientId)
      const lastMessage = conv.messages?.[conv.messages.length - 1]
      
      return {
        id: conv.id,
        name: otherParticipant?.fullName || 'Unknown',
        avatar: otherParticipant?.fullName?.charAt(0) || '?',
        lastMessage: lastMessage?.content || 'No messages',
        snippet: lastMessage?.content?.substring(0, 30) + '...' || '',
        time: lastMessage?.createdAt 
          ? new Date(lastMessage.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : '',
        unread: conv.unreadCount > 0,
        unreadCount: conv.unreadCount,
      }
    })

    // Check for new lab results notification
    const hasNewLabResults = recentLabResults.some((result) => {
      const resultDate = new Date(result.testDate)
      const daysSince = (new Date().getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 7 // New if within last 7 days
    })

    return {
      patientName: patient.fullName || 'Patient',
      upcomingAppointments: formattedAppointments,
      secureMessages: formattedMessages,
      recentLabResults: recentLabResults.map((result) => ({
        id: result.id,
        testName: result.testName,
        testDate: result.testDate,
        status: result.results?.[0]?.status || 'normal',
      })),
      activePrescriptions: activePrescriptions.slice(0, 3).map((prescription) => ({
        id: prescription.id,
        medicationName: prescription.medicationName || 'Unknown',
        dosage: prescription.dosage || '',
        frequency: prescription.frequency || '',
      })),
      unreadMessagesCount: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
      hasNewLabResults,
      totalAppointments: (await this.getAppointments(patientId)).length,
      totalMedicalRecords: (await this.getMedicalRecords(patientId)).pagination.total,
    }
  }

  async bookAppointment(patientId: string, appointmentData: any) {
    return this.appointmentsService.create({
      ...appointmentData,
      patientId,
      status: AppointmentStatus.PENDING,
    })
  }

  async cancelAppointment(patientId: string, appointmentId: string) {
    const appointment = await this.appointmentsService.findOne(appointmentId)
    if (appointment.patientId !== patientId) {
      throw new NotFoundException('Appointment not found')
    }

    // Free up the slot if it exists
    const slot = await this.appointmentSlotRepository.findOne({
      where: { appointmentId: appointmentId },
    })
    if (slot) {
      slot.status = SlotStatus.AVAILABLE
      slot.appointmentId = null
      await this.appointmentSlotRepository.save(slot)
    }

    return this.appointmentsService.update(appointmentId, {
      status: AppointmentStatus.CANCELLED,
    })
  }

  async rescheduleAppointment(patientId: string, appointmentId: string, newDate: string, newTime: string) {
    const appointment = await this.appointmentsService.findOne(appointmentId)
    if (appointment.patientId !== patientId) {
      throw new NotFoundException('Appointment not found')
    }

    // Free up old slot if it exists
    const oldSlot = await this.appointmentSlotRepository.findOne({
      where: { appointmentId: appointmentId },
    })
    if (oldSlot) {
      oldSlot.status = SlotStatus.AVAILABLE
      oldSlot.appointmentId = null
      await this.appointmentSlotRepository.save(oldSlot)
    }

    // Find and book new slot
    const newSlot = await this.appointmentSlotRepository.findOne({
      where: {
        doctorId: appointment.doctorId,
        date: new Date(newDate),
        time: newTime,
        status: SlotStatus.AVAILABLE,
      },
    })

    if (!newSlot) {
      throw new BadRequestException('No available slot found for the selected date and time')
    }

    // Update appointment
    const updatedAppointment = await this.appointmentsService.update(appointmentId, {
      date: new Date(newDate) as any,
      time: newTime,
      status: AppointmentStatus.RESCHEDULED,
    })

    // Mark new slot as booked
    newSlot.status = SlotStatus.BOOKED
    newSlot.appointmentId = appointmentId
    await this.appointmentSlotRepository.save(newSlot)

    return updatedAppointment
  }

  async requestPrescriptionRefill(patientId: string, prescriptionId: string) {
    const prescription = await this.prescriptionsService.findOne(prescriptionId)
    if (prescription.patientId !== patientId) {
      throw new NotFoundException('Prescription not found')
    }
    return this.prescriptionsService.update(prescriptionId, {
      status: PrescriptionStatus.REFILL_REQUESTED,
    })
  }
}

