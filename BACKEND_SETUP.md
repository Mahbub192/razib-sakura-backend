# Sakura Backend Setup Guide

## ✅ Complete Backend Structure Created

### 📁 Project Structure

```
sakura-backend-code/
├── src/
│   ├── auth/                    # ✅ Authentication module
│   │   ├── dto/                 # Register, Login, OTP, Password Reset DTOs
│   │   ├── guards/              # JWT Auth Guard
│   │   ├── strategies/          # JWT & Local Strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/                   # ✅ User management
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── patients/                # ✅ Patient module
│   ├── doctors/                 # ✅ Doctor module
│   ├── assistants/              # ✅ Assistant module
│   ├── appointments/            # ✅ Appointment management
│   ├── medical-records/         # ✅ Medical records
│   ├── lab-results/             # ✅ Lab results
│   ├── prescriptions/           # ✅ Prescriptions
│   ├── messages/                # ✅ Messaging system
│   ├── clinics/                 # ✅ Clinic management
│   │
│   ├── common/                  # ✅ Shared utilities
│   │   ├── entities/            # Base entity
│   │   └── enums/               # User roles enum
│   │
│   ├── config/                  # ✅ Configuration
│   │   └── typeorm.config.ts    # Database configuration
│   │
│   ├── app.module.ts            # ✅ Main app module
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts                  # ✅ Application entry point
│
├── package.json                 # ✅ Dependencies
├── tsconfig.json                # ✅ TypeScript config
├── nest-cli.json                # ✅ NestJS CLI config
├── .env.example                # ✅ Environment template
└── README.md                    # ✅ Documentation
```

## 🗄️ Database Entities Created

1. **User** - Base user entity with roles (patient, doctor, assistant, admin)
2. **Clinic** - Clinic information
3. **Appointment** - Appointment management
4. **MedicalRecord** - Medical records
5. **LabResult** - Lab test results
6. **Prescription** - Prescription management
7. **Message** - Individual messages
8. **Conversation** - Message conversations

## 🔐 Authentication Features

- ✅ JWT-based authentication
- ✅ User registration
- ✅ Login with phone number
- ✅ OTP verification
- ✅ Password reset
- ✅ Role-based access control

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login
- `POST /verify` - Verify OTP
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /profile` - Get user profile (protected)

### Users (`/api/users`)
- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `GET /profile` - Get current user profile
- `PATCH /:id` - Update user
- `DELETE /:id` - Delete user

### Patients (`/api/patients`)
- `GET /` - Get all patients
- `GET /:id` - Get patient by ID
- `GET /:id/appointments` - Get patient appointments
- `GET /:id/medical-records` - Get patient medical records

### Doctors (`/api/doctors`)
- `GET /` - Get all doctors
- `GET /:id` - Get doctor by ID
- `GET /:id/appointments` - Get doctor appointments
- `GET /:id/patients` - Get doctor's patients

### Appointments (`/api/appointments`)
- `POST /` - Create appointment
- `GET /` - Get all appointments (with optional filters)
- `GET /:id` - Get appointment by ID
- `PATCH /:id` - Update appointment
- `DELETE /:id` - Cancel appointment

### Medical Records (`/api/medical-records`)
- `POST /` - Create medical record
- `GET /` - Get all medical records
- `GET /:id` - Get medical record by ID
- `PATCH /:id` - Update medical record
- `DELETE /:id` - Delete medical record

### Lab Results (`/api/lab-results`)
- `POST /` - Create lab result
- `GET /` - Get all lab results
- `GET /:id` - Get lab result by ID
- `PATCH /:id` - Update lab result
- `DELETE /:id` - Delete lab result

### Prescriptions (`/api/prescriptions`)
- `POST /` - Create prescription
- `GET /` - Get all prescriptions
- `GET /:id` - Get prescription by ID
- `PATCH /:id` - Update prescription
- `DELETE /:id` - Delete prescription

### Messages (`/api/messages`)
- `POST /` - Send message
- `GET /conversations` - Get user conversations
- `GET /conversations/:id` - Get conversation messages
- `POST /:id/read` - Mark message as read

### Clinics (`/api/clinics`)
- `POST /` - Create clinic
- `GET /` - Get all clinics
- `GET /:id` - Get clinic by ID
- `PATCH /:id` - Update clinic
- `DELETE /:id` - Delete clinic

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd sakura-backend-code
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Set Up PostgreSQL Database
```bash
# Create database
createdb sakura_db

# Or using psql:
psql -U postgres
CREATE DATABASE sakura_db;
```

### 4. Run Migrations (if needed)
```bash
npm run migration:run
```

### 5. Start Development Server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=sakura_db

# Application
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📝 Next Steps

1. **Install dependencies:** `npm install`
2. **Set up database:** Create PostgreSQL database
3. **Configure .env:** Update database credentials
4. **Run migrations:** `npm run migration:run` (if needed)
5. **Start server:** `npm run start:dev`
6. **Test API:** Use Postman or curl to test endpoints

## 🧪 Testing API

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "phoneNumber": "+1234567890",
    "password": "password123",
    "fullName": "John Doe",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "password123"
  }'
```

### Get Profile (with JWT token)
```bash
curl -X POST http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 Documentation

- All endpoints are protected by JWT authentication (except register/login)
- Use `Authorization: Bearer <token>` header for protected routes
- All DTOs use class-validator for validation
- TypeORM is configured for PostgreSQL
- CORS is enabled for frontend (localhost:3000)

## ✅ Features Implemented

- ✅ Complete authentication system
- ✅ User management (CRUD)
- ✅ Patient management
- ✅ Doctor management
- ✅ Assistant management
- ✅ Appointment management
- ✅ Medical records
- ✅ Lab results
- ✅ Prescriptions
- ✅ Messaging system
- ✅ Clinic management
- ✅ Database entities with relationships
- ✅ DTOs with validation
- ✅ JWT authentication
- ✅ Role-based access control

---

**Status:** ✅ Backend structure complete and ready for development!

