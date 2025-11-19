# Sakura Backend API

Backend API for Sakura Healthcare Management System built with NestJS and PostgreSQL.

## Features

- 🔐 JWT Authentication
- 👥 User Management (Patient, Doctor, Assistant, Admin)
- 📅 Appointment Management
- 📋 Medical Records
- 🧪 Lab Results
- 💊 Prescriptions
- 💬 Messaging System
- 📊 Reports & Analytics

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT (Passport)
- **Validation:** class-validator
- **Language:** TypeScript

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database:**
   ```bash
   # Create database
   createdb sakura_db

   # Or using PostgreSQL CLI:
   psql -U postgres
   CREATE DATABASE sakura_db;
   ```

4. **Run migrations:**
   ```bash
   npm run migration:run
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3001`

## Project Structure

```
src/
├── auth/              # Authentication module
├── users/             # User management
├── patients/          # Patient module
├── doctors/           # Doctor module
├── assistants/        # Assistant module
├── appointments/      # Appointment module
├── medical-records/   # Medical records module
├── lab-results/       # Lab results module
├── prescriptions/     # Prescriptions module
├── messages/          # Messaging module
├── clinics/           # Clinic management
├── common/            # Shared utilities
├── config/            # Configuration files
└── main.ts            # Application entry point
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/verify` - Verify OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Patients
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID
- `PUT /patients/:id` - Update patient
- `GET /patients/:id/appointments` - Get patient appointments
- `GET /patients/:id/medical-records` - Get patient medical records

### Doctors
- `GET /doctors` - Get all doctors
- `GET /doctors/:id` - Get doctor by ID
- `PUT /doctors/:id` - Update doctor
- `GET /doctors/:id/appointments` - Get doctor appointments
- `GET /doctors/:id/patients` - Get doctor's patients

### Appointments
- `GET /appointments` - Get all appointments
- `POST /appointments` - Create appointment
- `GET /appointments/:id` - Get appointment by ID
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment

### Medical Records
- `GET /medical-records` - Get all medical records
- `POST /medical-records` - Create medical record
- `GET /medical-records/:id` - Get medical record by ID
- `PUT /medical-records/:id` - Update medical record

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/migrations/YourMigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

## License

Private - All rights reserved

