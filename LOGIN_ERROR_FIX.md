# 🔧 Login Error Fix

## ❌ Problem
Login করার সময় 500 Internal Server Error আসছিল।

## ✅ Solution Applied

### 1. **Password Field Selection Fix**
`findByPhoneNumber` method-এ password field properly select করার জন্য `createQueryBuilder` ব্যবহার করা হয়েছে:

```typescript
async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
  return this.usersRepository
    .createQueryBuilder('user')
    .where('user.phoneNumber = :phoneNumber', { phoneNumber })
    .addSelect('user.password') // Explicitly add password
    .getOne()
}
```

### 2. **Error Handling Improved**
Login method-এ better error handling যোগ করা হয়েছে:

```typescript
async login(loginDto: LoginDto) {
  try {
    // ... login logic
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials - password not found')
    }
    // ... rest of logic
  } catch (error) {
    // Proper error handling
  }
}
```

### 3. **Exception Filter Enhanced**
Development mode-এ detailed error messages দেখানোর জন্য exception filter update করা হয়েছে।

---

## 🧪 Test Login

### Using Swagger:
1. Go to: `http://localhost:3001/api/docs`
2. Find `POST /api/auth/login`
3. Use credentials:
   ```json
   {
     "phoneNumber": "+8801234567890",
     "password": "admin123"
   }
   ```

### Using cURL:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+8801234567890",
    "password": "admin123"
  }'
```

---

## ✅ Expected Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@sakura.com",
      "phoneNumber": "+8801234567890",
      "fullName": "Admin User",
      "role": "admin",
      "avatar": null
    }
  }
}
```

---

## 🔍 If Still Getting Error

1. **Check Backend Logs:**
   - Backend server console-এ error message দেখুন
   - Development mode-এ detailed error দেখাবে

2. **Verify Database:**
   - Users table-এ data আছে কিনা check করুন
   - Seed script run করেছেন কিনা verify করুন

3. **Check Environment:**
   - `.env` file-এ `JWT_SECRET` আছে কিনা
   - Database connection ঠিক আছে কিনা

4. **Restart Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run start:dev
   ```

---

**✅ Login এখন কাজ করা উচিত!**

