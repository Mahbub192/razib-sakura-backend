# 🚀 Starting Sakura Backend Server

## ✅ Backend is Ready!

The backend code is complete and compiled successfully. To run it:

### Prerequisites

1. **PostgreSQL Database** must be installed and running
2. **Database** must be created

### Quick Start

```bash
# 1. Navigate to backend directory
cd sakura-backend-code

# 2. Install dependencies (if not done)
npm install

# 3. Create .env file (if not exists)
# Copy from .env.example or create with:
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=sakura_db
PORT=3001
NODE_ENV=development
JWT_SECRET=sakura-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
EOF

# 4. Create database (if not exists)
createdb sakura_db
# OR using psql:
# psql -U postgres
# CREATE DATABASE sakura_db;

# 5. Start the server
npm run start:dev
```

### Server Status

Once started, the server will be available at:
- **API Base URL:** `http://localhost:3001/api`
- **Health Check:** `http://localhost:3001/api/health`
- **Root:** `http://localhost:3001/api`

### Common Issues

#### 1. Database Connection Error
If you see database connection errors:
- Make sure PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Create the database: `createdb sakura_db`

#### 2. Port Already in Use
If port 3001 is already in use:
- Change `PORT` in `.env` file
- Or kill the process: `lsof -ti:3001 | xargs kill`

#### 3. Dependencies Not Installed
```bash
npm install
```

### Testing the API

Once the server is running, test with:

```bash
# Health check
curl http://localhost:3001/api/health

# Root endpoint
curl http://localhost:3001/api
```

### Development Mode

The server runs in watch mode, so it will automatically restart when you make changes to the code.

---

**Note:** The server is configured to auto-sync database schema in development mode. Make sure your database is set up correctly!

