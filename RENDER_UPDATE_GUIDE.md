# Render Backend Update Guide

## 🚀 What Was Updated

### New Features Added:
1. **Admin Service Management** - Full CRUD operations for services
2. **Users Management** - View all users with booking statistics
3. **Enhanced Bookings** - Added `total_amount` field to track pricing
4. **Database Migrations** - Automatic schema updates for existing databases

### Updated Files:
- ✅ `routes/services.js` - Added CREATE, UPDATE, DELETE endpoints (admin only)
- ✅ `routes/users.js` - NEW FILE for user management (admin only)
- ✅ `routes/bookings.js` - Added total_amount field handling
- ✅ `config/database.js` - Added total_amount column migration
- ✅ `server.js` - Added users route

---

## 📋 API Endpoints Summary

### Services (Admin Features)
- `POST /api/services` - Create new service (admin only)
- `PUT /api/services` - Update service (admin only)
- `DELETE /api/services?id={id}` - Delete service (admin only)

### Users (Admin Only)
- `GET /api/users` - Get all users with booking counts
- `GET /api/users/:id` - Get single user details

### Bookings (Enhanced)
- `POST /api/bookings` - Now includes `total_amount` field
- `GET /api/bookings` - Returns total_amount for all bookings

---

## 🔧 How to Deploy to Render

### Option 1: Push to Git (Recommended)

1. **Commit the changes:**
   ```bash
   cd c:\Users\Admin\Desktop\booking_app\backend
   git add .
   git commit -m "Add admin service management and users endpoints"
   git push origin main
   ```

2. **Render will auto-deploy:**
   - Go to https://dashboard.render.com
   - Your backend service will automatically redeploy
   - Wait 2-3 minutes for deployment to complete

### Option 2: Manual File Upload

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Go to "Manual Deploy" > "Clear build cache & deploy"

---

## 🗄️ Database Migration

The database will automatically migrate when the backend restarts. It will:

1. ✅ Add `total_amount` column to bookings table
2. ✅ Add `updated_at` column to users table
3. ✅ Keep all existing data intact

**No manual database changes needed!**

---

## 🧪 Testing the Updated API

### Test Service Creation (Admin):
```bash
curl -X POST https://car-wash-booking-backend.onrender.com/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test Service",
    "price": 500,
    "description": "Test description"
  }'
```

### Test Users Endpoint (Admin):
```bash
curl https://car-wash-booking-backend.onrender.com/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Booking with Total Amount:
```bash
curl -X POST https://car-wash-booking-backend.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "service_id": 1,
    "booking_date": "2025-01-15",
    "booking_time": "10:00",
    "customer_name": "John Doe",
    "customer_phone": "09123456789",
    "customer_email": "john@example.com",
    "car_type": "Sedan",
    "license_plate": "ABC123",
    "total_amount": 500
  }'
```

---

## 🔐 Admin Access

### Default Admin Credentials:
- **Email:** admin@gmail.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change the admin password after first login!

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Services page loads correctly
- [ ] Admin can create new services
- [ ] Admin can edit existing services
- [ ] Admin can delete services (without bookings)
- [ ] Users page shows all customers
- [ ] Bookings page displays correct amounts
- [ ] Booking creation includes total_amount

---

## 🆘 Troubleshooting

### If services endpoints return 401/403:
- Make sure you're logged in as admin
- Check that your token includes `"role": "admin"`

### If total_amount is null in bookings:
- Old bookings may not have total_amount
- New bookings will automatically include it
- Frontend displays fallback prices based on service name

### If deployment fails:
1. Check Render logs for errors
2. Verify all files are committed to git
3. Clear build cache and redeploy
4. Check environment variables are set

---

## 📊 Database Schema Changes

### Bookings Table:
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
```

### Users Table:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

These migrations run automatically on server startup!

---

## 🎯 Expected Services in Database

The backend will auto-create these 8 services if none exist:

1. Basic Wash - ₱200
2. Express Wash - ₱300
3. Interior Cleaning - ₱400
4. Standard Wash - ₱500
5. Engine Bay Cleaning - ₱600
6. Full Service Wash - ₱700
7. Deep Cleaning - ₱800
8. Premium Detailing - ₱1000

---

## 📱 Mobile App Compatibility

Your React Native app is already configured to use these endpoints:

- `getApiUrl('SERVICES_CREATE')` → POST /api/services
- `getApiUrl('SERVICES_UPDATE')` → PUT /api/services
- `getApiUrl('SERVICES_DELETE')` → DELETE /api/services
- `getApiUrl('USERS')` → GET /api/users
- `getApiUrl('BOOKING')` → POST /api/bookings (with total_amount)

**No frontend changes needed!** Everything is ready to work.

---

## 🔄 Rollback (If Needed)

If something goes wrong:

1. Go to Render dashboard
2. Select your service
3. Go to "Events" tab
4. Click "Rollback" on previous deployment

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard > Your Service > Logs
2. Test API with curl/Postman
3. Verify database migrations completed
4. Check admin token is valid

---

## ✨ Summary

Your backend now supports:
- ✅ Full admin panel functionality
- ✅ Service CRUD operations
- ✅ User management
- ✅ Enhanced booking tracking
- ✅ Automatic database migrations
- ✅ 8 pre-configured car wash services

**Deploy and enjoy your fully-featured car wash booking system! 🚗💦**
