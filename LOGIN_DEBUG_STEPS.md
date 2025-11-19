# 🔍 Login Debug Steps

## ✅ Changes Made

1. **Added Detailed Logging** to `auth.service.ts` login method
2. **Removed Generic Error Handling** - Now shows specific error messages
3. **Password Field Selection** - Already fixed using `createQueryBuilder` with `addSelect`

---

## 🔄 Next Steps

### 1. **Restart Backend Server**
```bash
cd sakura-backend-code
# Stop current server (Ctrl+C if running)
npm run start:dev
```

### 2. **Try Login Again**
Use Swagger UI: `http://localhost:3001/api/docs`

**Credentials:**
```json
{
  "phoneNumber": "+8801234567890",
  "password": "admin123"
}
```

### 3. **Check Backend Console Logs**
You should now see detailed logs like:
```
[LOGIN] Attempting login for phone: +8801234567890
[LOGIN] User found: <user-id>, email: admin@sakura.com, hasPassword: true
[LOGIN] Comparing password...
[LOGIN] Password comparison result: true/false
[LOGIN] Generating JWT token for user: <user-id>
[LOGIN] Login successful for user: <user-id>
```

---

## 🐛 If Still Getting Error

### Check Backend Console for:
1. **User not found?** → Check if seed script ran successfully
2. **Password not found?** → Password field not being selected properly
3. **Password comparison false?** → Password hash mismatch
4. **JWT token error?** → JWT_SECRET not configured

### Verify Database:
```bash
PGPASSWORD=12345 psql -h localhost -p 5433 -U postgres -d sakura_db -c "SELECT id, email, \"phoneNumber\", \"fullName\", role FROM users WHERE \"phoneNumber\" = '+8801234567890';"
```

### Re-run Seed Script (if needed):
```bash
cd sakura-backend-code
npm run seed
```

---

## 📝 Expected Success Response

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

**✅ After restarting, check the backend console logs to see exactly where the login is failing!**

