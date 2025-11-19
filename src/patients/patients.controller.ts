import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { PatientsService } from './patients.service'
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AppointmentStatus } from '../appointments/entities/appointment.entity'
import { PrescriptionStatus } from '../prescriptions/entities/prescription.entity'

@ApiTags('patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  findAll() {
    return this.patientsService.findAll()
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile' })
  getProfile(@Request() req) {
    return this.patientsService.findOne(req.user.id)
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(@Request() req, @Body() updateDto: UpdatePatientProfileDto) {
    return this.patientsService.updateProfile(req.user.id, updateDto)
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get patient dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  getDashboard(@Request() req) {
    return this.patientsService.getDashboardData(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id)
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Get patient appointments' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  getAppointments(@Param('id') id: string, @Query('status') status?: AppointmentStatus) {
    return this.patientsService.getAppointments(id, status)
  }

  @Get(':id/appointments/upcoming')
  @ApiOperation({ summary: 'Get upcoming appointments' })
  @ApiResponse({ status: 200, description: 'List of upcoming appointments' })
  getUpcomingAppointments(@Param('id') id: string) {
    return this.patientsService.getUpcomingAppointments(id)
  }

  @Post(':id/appointments')
  @ApiOperation({ summary: 'Book appointment' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  bookAppointment(@Param('id') id: string, @Body() appointmentData: any) {
    return this.patientsService.bookAppointment(id, appointmentData)
  }

  @Post(':id/appointments/:appointmentId/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  cancelAppointment(@Param('id') id: string, @Param('appointmentId') appointmentId: string) {
    return this.patientsService.cancelAppointment(id, appointmentId)
  }

  @Post(':id/appointments/:appointmentId/reschedule')
  @ApiOperation({ summary: 'Reschedule appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled' })
  rescheduleAppointment(
    @Param('id') id: string,
    @Param('appointmentId') appointmentId: string,
    @Body() body: { date: string; time: string },
  ) {
    return this.patientsService.rescheduleAppointment(id, appointmentId, body.date, body.time)
  }

  @Get(':id/medical-records')
  @ApiOperation({ summary: 'Get patient medical records' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of medical records with pagination' })
  getMedicalRecords(
    @Param('id') id: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.patientsService.getMedicalRecords(id, category, pageNum, limitNum)
  }

  @Get(':id/lab-results')
  @ApiOperation({ summary: 'Get patient lab results' })
  @ApiQuery({ name: 'testType', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of lab results with doctor notes' })
  getLabResults(
    @Param('id') id: string,
    @Query('testType') testType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.patientsService.getLabResults(id, testType, startDate, endDate)
  }

  @Get(':id/prescriptions')
  @ApiOperation({ summary: 'Get patient prescriptions' })
  @ApiQuery({ name: 'status', required: false, enum: PrescriptionStatus })
  @ApiResponse({ status: 200, description: 'List of prescriptions' })
  getPrescriptions(@Param('id') id: string, @Query('status') status?: PrescriptionStatus) {
    return this.patientsService.getPrescriptions(id, status)
  }

  @Get(':id/prescriptions/active')
  @ApiOperation({ summary: 'Get active prescriptions' })
  @ApiResponse({ status: 200, description: 'List of active prescriptions' })
  getActivePrescriptions(@Param('id') id: string) {
    return this.patientsService.getActivePrescriptions(id)
  }

  @Post(':id/prescriptions/:prescriptionId/refill')
  @ApiOperation({ summary: 'Request prescription refill' })
  @ApiResponse({ status: 200, description: 'Refill requested' })
  requestRefill(@Param('id') id: string, @Param('prescriptionId') prescriptionId: string) {
    return this.patientsService.requestPrescriptionRefill(id, prescriptionId)
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get patient conversations' })
  @ApiQuery({ name: 'conversationId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of conversations with optional messages' })
  getMessages(@Param('id') id: string, @Query('conversationId') conversationId?: string) {
    return this.patientsService.getMessages(id, conversationId)
  }
}

