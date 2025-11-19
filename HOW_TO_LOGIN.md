# 🔐 কিভাবে Login করবেন - বাংলা গাইড

## 📋 Login করার জন্য Credentials

### 👤 **ADMIN (এডমিন)**
```
Phone Number: +8801234567890
Password: admin123
```

### 👨‍⚕️ **DOCTOR (ডাক্তার)**
```
Phone Number: +8801234567891
Password: doctor123
```

### 👤 **PATIENT (রোগী)**
```
Phone Number: +8801234567892
Password: patient123
```

### 👥 **ASSISTANT (সহকারী)**
```
Phone Number: +8801234567893
Password: assistant123
```

---

## 🚀 প্রথমবার Setup

### Step 1: Database Seed করুন

```bash
cd sakura-backend-code
npm run seed
```

এটি database-এ সব default users তৈরি করবে।

### Step 2: Backend Server Start করুন

```bash
npm run start:dev
```

Server চলবে: `http://localhost:3001`

---

## 🔑 Login করার ৩টি উপায়

### Method 1: Swagger UI দিয়ে (সবচেয়ে সহজ)

1. **Swagger UI খুলুন:**
   ```
   http://localhost:3001/api/docs
   ```

2. **Login Endpoint খুঁজুন:**
   - `POST /api/auth/login` endpoint খুঁজুন
   - "Try it out" বাটনে ক্লিক করুন

3. **Credentials দিন:**
   ```json
   {
     "phoneNumber": "+8801234567891",
     "password": "doctor123"
   }
   ```

4. **Execute করুন:**
   - "Execute" বাটনে ক্লিক করুন
   - Response থেকে `accessToken` কপি করুন

5. **Authorize করুন:**
   - উপরে "Authorize" বাটনে ক্লিক করুন
   - Token paste করুন
   - "Authorize" ক্লিক করুন
   - এখন সব protected endpoints test করতে পারবেন

### Method 2: cURL দিয়ে

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+8801234567891",
    "password": "doctor123"
  }'
```

**Response:**
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

### Method 3: Frontend দিয়ে

1. **Login API Call:**
   ```javascript
   const response = await fetch('http://localhost:3001/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       phoneNumber: '+8801234567891',
       password: 'doctor123'
     })
   })
   
   const data = await response.json()
   ```

2. **Token Save করুন:**
   ```javascript
   // Token localStorage-এ save করুন
   localStorage.setItem('auth-token', data.data.accessToken)
   
   // অথবা API client ব্যবহার করুন
   apiClient.setAuthToken(data.data.accessToken)
   ```

3. **এখন সব API calls automatically token সহ যাবে**

---

## 📝 Login API Details

### Endpoint
```
POST /api/auth/login
```

### Request Body
```json
{
  "phoneNumber": "+8801234567891",
  "password": "doctor123"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
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

## 🎯 Doctor Dashboard Access

Doctor হিসেবে login করার পর:

1. **Dashboard Data:**
   ```
   GET /api/doctors/dashboard
   Authorization: Bearer <token>
   ```

2. **Patients List:**
   ```
   GET /api/doctors/:id/patients
   Authorization: Bearer <token>
   ```

3. **Appointments:**
   ```
   GET /api/doctors/:id/appointments
   Authorization: Bearer <token>
   ```

---

## 🎯 Patient Dashboard Access

Patient হিসেবে login করার পর:

1. **Dashboard Data:**
   ```
   GET /api/patients/dashboard
   Authorization: Bearer <token>
   ```

2. **Appointments:**
   ```
   GET /api/patients/:id/appointments
   Authorization: Bearer <token>
   ```

---

## ⚠️ Important Notes

1. **Phone Number Format:**
   - অবশ্যই country code সহ দিন (যেমন: `+8801234567891`)
   - `+` sign অবশ্যই থাকতে হবে

2. **Password:**
   - Case-sensitive (ছোট-বড় হাতের পার্থক্য আছে)
   - Default passwords:
     - Admin: `admin123`
     - Doctor: `doctor123`
     - Patient: `patient123`
     - Assistant: `assistant123`

3. **Token:**
   - Token 7 দিন valid থাকে
   - প্রতিটি protected API call-এ token পাঠাতে হবে
   - Header format: `Authorization: Bearer <token>`

---

## 🛠️ Troubleshooting

### সমস্যা: "Invalid credentials"
- ✅ Phone number সঠিক format-এ আছে কিনা check করুন (`+880...`)
- ✅ Password সঠিক আছে কিনা check করুন
- ✅ Seed script run করেছেন কিনা check করুন

### সমস্যা: "User not found"
- ✅ Seed script run করুন: `npm run seed`
- ✅ Database connection check করুন

### সমস্যা: Token কাজ করছে না
- ✅ Token সঠিকভাবে copy করেছেন কিনা check করুন
- ✅ Authorization header format check করুন: `Bearer <token>`
- ✅ Token expire হয়ে গেছে কিনা check করুন

---

## 📞 Quick Reference

| Role | Phone | Password |
|------|-------|----------|
| Admin | +8801234567890 | admin123 |
| Doctor | +8801234567891 | doctor123 |
| Patient | +8801234567892 | patient123 |
| Assistant | +8801234567893 | assistant123 |

---

**✅ এখন আপনি login করতে পারবেন!**

