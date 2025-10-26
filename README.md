# 🚗 Car Wash Booking Backend API

Node.js + Express + PostgreSQL backend for the Car Wash Booking mobile application.

**Live API:** https://car-wash-booking-backend.onrender.com

---

## 🌟 Features

### Customer Features
- ✅ User registration & JWT authentication
- ✅ Browse available car wash services
- ✅ Create bookings with date/time selection
- ✅ View booking history
- ✅ Update profile information
- ✅ Cancel bookings

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Manage services (Create, Read, Update, Delete)
- ✅ View all bookings with status management
- ✅ User management & analytics
- ✅ Revenue tracking

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Hosting:** Render (with auto-deploy)

---

## 📋 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/health` | Database health check |
| GET | `/api/services` | List all services |
| GET | `/api/services/:id` | Get service details |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |

### Authenticated User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings` | Get user's bookings | User Token |
| POST | `/api/bookings` | Create new booking | User Token |
| PATCH | `/api/bookings/:id` | Update booking status | User Token |
| PUT | `/api/auth/update-profile` | Update profile | User Token |

### Admin Only Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/services` | Create service | Admin Token |
| PUT | `/api/services` | Update service | Admin Token |
| DELETE | `/api/services?id=X` | Delete service | Admin Token |
| GET | `/api/users` | List all users | Admin Token |
| GET | `/api/users/:id` | Get user details | Admin Token |
| PUT | `/api/bookings/:id` | Update booking (admin) | Admin Token |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/carwasha850-commits/carwash-db.git
   cd carwash-db
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   NODE_ENV=production
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

---

## 🗄️ Database Schema

### Tables

#### users
```sql
id              SERIAL PRIMARY KEY
username        VARCHAR(50) UNIQUE
email           VARCHAR(100) UNIQUE
password_hash   VARCHAR(255)
full_name       VARCHAR(100)
phone           VARCHAR(20)
role            VARCHAR(20) DEFAULT 'customer'
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### services
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100)
price       DECIMAL(10,2)
description TEXT
```

#### bookings
```sql
id             SERIAL PRIMARY KEY
user_id        INTEGER REFERENCES users(id)
service_id     INTEGER REFERENCES services(id)
booking_date   DATE
booking_time   TIME
customer_name  VARCHAR(100)
customer_phone VARCHAR(20)
customer_email VARCHAR(100)
car_type       VARCHAR(50)
license_plate  VARCHAR(20)
car_color      VARCHAR(30)
notes          TEXT
status         VARCHAR(20) DEFAULT 'pending'
total_amount   DECIMAL(10,2)
created_at     TIMESTAMP
```

---

## 🔐 Authentication

### Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "full_name": "John Doe",
  "phone": "09123456789"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}

Response:
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Token
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 👨‍💼 Admin Access

### Default Admin Credentials
- **Email:** admin@gmail.com
- **Password:** admin123

⚠️ **IMPORTANT:** Change the admin password immediately after first deployment!

### Creating Additional Admins
Manually update the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 💰 Default Services

The backend automatically creates these 8 services on first run:

| Service | Price | Description |
|---------|-------|-------------|
| Basic Wash | ₱200 | Simple exterior rinse and soap cleaning |
| Express Wash | ₱300 | Quick exterior wash and rinse (15 minutes) |
| Interior Cleaning | ₱400 | Vacuum, dashboard cleaning, and seat wiping |
| Standard Wash | ₱500 | Complete exterior wash with soap and wax |
| Engine Bay Cleaning | ₱600 | Professional engine compartment cleaning |
| Full Service Wash | ₱700 | Exterior wash + interior cleaning combo |
| Deep Cleaning | ₱800 | Thorough interior and exterior deep cleaning |
| Premium Detailing | ₱1000 | Complete premium cleaning with wax and protection |

---

## 📦 Deployment

### Deploy to Render

1. **Connect GitHub Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Create new "Web Service"
   - Connect this GitHub repository

2. **Configure Service:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Add Environment Variables:**
   ```
   DATABASE_URL (from Render PostgreSQL)
   JWT_SECRET (generate secure random string)
   NODE_ENV=production
   ```

4. **Deploy:**
   - Render will auto-deploy on every push to main branch
   - Database migrations run automatically

---

## 🧪 Testing

### Test Health Endpoint
```bash
curl https://car-wash-booking-backend.onrender.com/
```

### Test Services
```bash
curl https://car-wash-booking-backend.onrender.com/api/services
```

### Test Admin Login
```bash
curl -X POST https://car-wash-booking-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@gmail.com",
    "password": "admin123"
  }'
```

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection & migrations
├── routes/
│   ├── auth.js             # Authentication endpoints
│   ├── bookings.js         # Booking management
│   ├── services.js         # Service CRUD operations
│   ├── users.js            # User management (admin)
│   └── update.js           # Update utilities
├── scripts/
│   └── update-services.js  # Service update script
├── server.js               # Express app entry point
├── package.json            # Dependencies
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

---

## 🔄 Auto-Deploy Setup

This repository is configured for automatic deployment:

1. **Push to main branch** → Render auto-deploys
2. **Database migrations** run automatically on startup
3. **Zero downtime** deployments
4. **Health checks** ensure stability

---

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set in Render
- Check PostgreSQL service is running
- Ensure database allows external connections

### Authentication Errors
- Verify `JWT_SECRET` is set
- Check token format: `Bearer <token>`
- Ensure token hasn't expired (24h validity)

### Admin Access Issues
- Use email (not username) for admin login
- Default: admin@gmail.com / admin123
- Check role is set to 'admin' in database

---

## 📊 API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

---

## 🔒 Security

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens with 24-hour expiration
- ✅ Role-based access control (admin/customer)
- ✅ SQL injection prevention via parameterized queries
- ✅ CORS enabled for mobile app access
- ✅ Environment variables for sensitive data

---

## 📝 License

ISC License

---

## 👨‍💻 Author

**carwasha850-commits**
- Email: carwasha850@gmail.com
- GitHub: [@carwasha850-commits](https://github.com/carwasha850-commits)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

For issues or questions:
1. Check the [RENDER_UPDATE_GUIDE.md](./RENDER_UPDATE_GUIDE.md)
2. Review [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)
3. Open an issue on GitHub
4. Check Render logs for deployment issues

---

## ✨ What's New

### Latest Updates (v2.0)
- ✅ Full admin panel support
- ✅ Service CRUD operations
- ✅ User management with analytics
- ✅ Enhanced booking system with pricing
- ✅ Automatic database migrations
- ✅ 8 pre-configured services
- ✅ Revenue tracking

---

## 🎯 Roadmap

- [ ] Email notifications for bookings
- [ ] SMS reminders via Twilio
- [ ] Payment integration (PayPal/Stripe)
- [ ] Booking scheduling conflicts prevention
- [ ] Service categories and filtering
- [ ] Customer reviews and ratings
- [ ] Loyalty points system

---

**Built with ❤️ for car wash businesses** 🚗💦
