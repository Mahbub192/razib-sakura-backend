import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { DoctorsService } from './doctors.service'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'
import { CreateAppointmentSlotDto } from './dto/create-appointment-slot.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AppointmentStatus } from '../appointments/entities/appointment.entity'

@ApiTags('doctors')
@ApiBearerAuth('JWT-auth')
@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({ status: 200, description: 'List of doctors' })
  findAll() {
    return this.doctorsService.findAll()
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile' })
  getProfile(@Request() req) {
    return this.doctorsService.findOne(req.user.id)
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update doctor profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(@Request() req, @Body() updateDto: UpdateDoctorProfileDto) {
    return this.doctorsService.updateProfile(req.user.id, updateDto)
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get doctor dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  getDashboard(@Request() req) {
    return this.doctorsService.getDashboardData(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor details' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id)
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Get doctor appointments' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  getAppointments(
    @Param('id') id: string,
    @Query('status') status?: AppointmentStatus,
    @Query('date') date?: string,
  ) {
    return this.doctorsService.getAppointments(id, status, date)
  }

  @Get(':id/appointments/today')
  @ApiOperation({ summary: 'Get today appointments' })
  @ApiResponse({ status: 200, description: 'Today appointments' })
  getTodayAppointments(@Param('id') id: string) {
    return this.doctorsService.getTodayAppointments(id)
  }

  @Get(':id/appointments/upcoming')
  @ApiOperation({ summary: 'Get upcoming appointments' })
  @ApiResponse({ status: 200, description: 'Upcoming appointments' })
  getUpcomingAppointments(@Param('id') id: string) {
    return this.doctorsService.getUpcomingAppointments(id)
  }

  @Get(':id/appointments/range')
  @ApiOperation({ summary: 'Get appointments by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Appointments in date range' })
  getAppointmentsByRange(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.doctorsService.getAppointmentsByDateRange(id, startDate, endDate)
  }

  @Post(':id/appointments/:appointmentId/confirm')
  @ApiOperation({ summary: 'Confirm appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed' })
  confirmAppointment(@Param('id') id: string, @Param('appointmentId') appointmentId: string) {
    return this.doctorsService.confirmAppointment(id, appointmentId)
  }

  @Post(':id/appointments/:appointmentId/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  cancelAppointment(@Param('id') id: string, @Param('appointmentId') appointmentId: string) {
    return this.doctorsService.cancelAppointment(id, appointmentId)
  }

  @Get(':id/patients')
  @ApiOperation({ summary: 'Get doctor patients' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of patients with pagination' })
  getPatients(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.doctorsService.getPatients(id, search, pageNum, limitNum)
  }

  @Get(':id/patients/:patientId')
  @ApiOperation({ summary: 'Get patient details' })
  @ApiResponse({ status: 200, description: 'Patient details with history' })
  getPatientDetails(@Param('id') id: string, @Param('patientId') patientId: string) {
    return this.doctorsService.getPatientDetails(id, patientId)
  }

  @Get(':id/reports')
  @ApiOperation({ summary: 'Get doctor reports and analytics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Reports data' })
  getReports(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.doctorsService.getReports(id, startDate, endDate)
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get doctor conversations' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  getMessages(@Param('id') id: string) {
    return this.doctorsService.getMessages(id)
  }

  @Post(':id/appointment-slots')
  @ApiOperation({ summary: 'Create appointment slot' })
  @ApiResponse({ status: 201, description: 'Slot created successfully' })
  createAppointmentSlot(@Param('id') id: string, @Body() slotData: CreateAppointmentSlotDto) {
    return this.doctorsService.createAppointmentSlot(id, slotData)
  }

  @Get(':id/appointment-slots')
  @ApiOperation({ summary: 'Get appointment slots' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of appointment slots' })
  getAppointmentSlots(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.doctorsService.getAppointmentSlots(id, startDate, endDate)
  }

  @Post(':id/patients/:patientId/medical-records')
  @ApiOperation({ summary: 'Create medical record for patient' })
  @ApiResponse({ status: 201, description: 'Medical record created' })
  createMedicalRecord(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
    @Body() recordData: any,
  ) {
    return this.doctorsService.createMedicalRecord(id, patientId, recordData)
  }

  @Post(':id/patients/:patientId/lab-results')
  @ApiOperation({ summary: 'Create lab result for patient' })
  @ApiResponse({ status: 201, description: 'Lab result created' })
  createLabResult(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
    @Body() labData: any,
  ) {
    return this.doctorsService.createLabResult(id, patientId, labData)
  }

  @Post(':id/patients/:patientId/prescriptions')
  @ApiOperation({ summary: 'Create prescription for patient' })
  @ApiResponse({ status: 201, description: 'Prescription created' })
  createPrescription(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
    @Body() prescriptionData: any,
  ) {
    return this.doctorsService.createPrescription(id, patientId, prescriptionData)
  }

  @Get('profile/notifications')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences' })
  getNotificationPreferences(@Request() req) {
    return this.doctorsService.getNotificationPreferences(req.user.id)
  }

  @Patch('profile/notifications')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  updateNotificationPreferences(@Request() req, @Body() preferences: any) {
    return this.doctorsService.updateNotificationPreferences(req.user.id, preferences)
  }

  @Get('profile/clinic')
  @ApiOperation({ summary: 'Get doctor clinic information' })
  @ApiResponse({ status: 200, description: 'Clinic information' })
  getClinicInfo(@Request() req) {
    return this.doctorsService.getClinicInfo(req.user.id)
  }

  @Patch('profile/clinic')
  @ApiOperation({ summary: 'Update doctor clinic information' })
  @ApiResponse({ status: 200, description: 'Clinic information updated' })
  updateClinicInfo(@Request() req, @Body() clinicData: any) {
    return this.doctorsService.updateClinicInfo(req.user.id, clinicData)
  }
}

