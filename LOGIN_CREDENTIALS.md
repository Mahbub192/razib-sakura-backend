# 🔐 Login Credentials & Instructions

## 📝 Default Test Users

After running the seed script, you can use these credentials to login:

### 👤 **ADMIN User**
```
Phone Number: +8801234567890
Password: admin123
Email: admin@sakura.com
```

### 👨‍⚕️ **DOCTOR User**
```
Phone Number: +8801234567891
Password: doctor123
Email: doctor@sakura.com
Name: Dr. Anya Sharma
Specialty: Cardiology
```

### 👤 **PATIENT User**
```
Phone Number: +8801234567892
Password: patient123
Email: patient@sakura.com
Name: John Doe
```

### 👥 **ASSISTANT User**
```
Phone Number: +8801234567893
Password: assistant123
Email: assistant@sakura.com
Name: Jane Smith
```

---

## 🚀 How to Create Users (Seed Database)

### Step 1: Run Seed Script

```bash
cd sakura-backend-code
npm run seed
```

This will create all default users in the database.

### Step 2: Verify Users Created

Check the console output - you should see:
```
✅ Admin user created
✅ Doctor user created
✅ Patient user created
✅ Assistant user created
```

---

## 🔑 How to Login

### Method 1: Using Swagger UI

1. **Start Backend Server:**
   ```bash
   cd sakura-backend-code
   npm run start:dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3001/api/docs
   ```

3. **Login:**
   - Find `POST /api/auth/login` endpoint
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "phoneNumber": "+8801234567891",
       "password": "doctor123"
     }
     ```
   - Click "Execute"
   - Copy the `accessToken` from response

4. **Authorize:**
   - Click the "Authorize" button (top right)
   - Paste the token
   - Click "Authorize"
   - Now you can test protected endpoints

### Method 2: Using cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+8801234567891",
    "password": "doctor123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "doctor@sakura.com",
      "phoneNumber": "+8801234567891",
      "fullName": "Dr. Anya Sharma",
      "role": "doctor"
    }
  }
}
```

### Method 3: Using Frontend

1. **Set Token in localStorage:**
   ```javascript
   // After login API call
   const response = await fetch('http://localhost:3001/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       phoneNumber: '+8801234567891',
       password: 'doctor123'
     })
   })
   
   const data = await response.json()
   localStorage.setItem('auth-token', data.data.accessToken)
   ```

2. **Frontend will automatically use the token** for all API calls

---

## 📋 Login API Endpoint

### POST `/api/auth/login`

**Request Body:**
```json
{
  "phoneNumber": "+8801234567891",
  "password": "doctor123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "doctor@sakura.com",
      "phoneNumber": "+8801234567891",
      "fullName": "Dr. Anya Sharma",
      "role": "doctor",
      "avatar": null
    }
  }
}
```

---

## 🔄 Register New User

You can also register new users using the register endpoint:

### POST `/api/auth/register`

**Request Body:**
```json
{
  "email": "newdoctor@example.com",
  "phoneNumber": "+8801234567894",
  "password": "password123",
  "fullName": "Dr. New Doctor",
  "role": "doctor"
}
```

**Available Roles:**
- `patient`
- `doctor`
- `assistant`
- `admin`

---

## 🛠️ Troubleshooting

### Issue: "User not found" or "Invalid credentials"
- ✅ Make sure you ran the seed script: `npm run seed`
- ✅ Check phone number format: Must include country code (e.g., `+8801234567891`)
- ✅ Verify password is correct (case-sensitive)

### Issue: "Database connection error"
- ✅ Make sure PostgreSQL is running
- ✅ Check `.env` file has correct database credentials
- ✅ Verify database `sakura_db` exists

### Issue: Token not working
- ✅ Make sure token is included in Authorization header: `Bearer <token>`
- ✅ Check token hasn't expired (default: 7 days)
- ✅ Verify token format is correct

---

## 📝 Quick Reference

| Role | Phone | Password | Use Case |
|------|-------|----------|----------|
| Admin | +8801234567890 | admin123 | System administration |
| Doctor | +8801234567891 | doctor123 | Doctor dashboard access |
| Patient | +8801234567892 | patient123 | Patient portal access |
| Assistant | +8801234567893 | assistant123 | Assistant management |

---

## 🎯 Next Steps

1. **Run seed script** to create users
2. **Start backend server**
3. **Login using Swagger UI** or API
4. **Copy the accessToken**
5. **Use token** for protected API calls

---

**Note:** These are default test credentials. Change passwords in production!

