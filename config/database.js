const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database initialization script
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add updated_at column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('Updated_at column added/verified for users');
    } catch (error) {
      console.log('Updated_at column migration error (might already exist):', error.message);
    }

    // Add role column if it doesn't exist (migration for existing databases)
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer'
      `);
      console.log('Role column added/verified');
    } catch (error) {
      console.log('Role column migration error (might already exist):', error.message);
    }

    // Create default admin user if it doesn't exist
    const bcrypt = require('bcryptjs');
    try {
      const adminCheck = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
      if (parseInt(adminCheck.rows[0].count) === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await client.query(`
          INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
          ('admin', 'admin@gmail.com', $1, 'System Administrator', '09123456789', 'admin')
        `, [hashedPassword]);
        console.log('Default admin user created');
        console.log('Admin login: admin@gmail.com / admin123');
      }
    } catch (error) {
      console.log('Admin user creation error:', error.message);
    }

    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT
      )
    `);

    // Create bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        service_id INTEGER REFERENCES services(id),
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        customer_name VARCHAR(100),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(100),
        car_type VARCHAR(50),
        license_plate VARCHAR(20),
        car_color VARCHAR(30),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        total_amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add total_amount column if it doesn't exist (migration for existing databases)
    try {
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2)
      `);
      console.log('Total_amount column added/verified for bookings');
    } catch (error) {
      console.log('Total_amount column migration error (might already exist):', error.message);
    }

    // Add PayPal payment tracking columns
    try {
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'
      `);
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paypal_order_id VARCHAR(100)
      `);
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paypal_capture_id VARCHAR(100)
      `);
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP
      `);
      console.log('PayPal payment columns added/verified for bookings');
    } catch (error) {
      console.log('PayPal columns migration error (might already exist):', error.message);
    }

    // Insert default services if they don't exist
    const servicesCheck = await client.query('SELECT COUNT(*) FROM services');
    if (parseInt(servicesCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO services (name, price, description) VALUES
        ('Basic Wash', 200, 'Simple exterior rinse and soap cleaning'),
        ('Express Wash', 300, 'Quick exterior wash and rinse (15 minutes)'),
        ('Interior Cleaning', 400, 'Vacuum, dashboard cleaning, and seat wiping'),
        ('Standard Wash', 500, 'Complete exterior wash with soap and wax'),
        ('Engine Bay Cleaning', 600, 'Professional engine compartment cleaning'),
        ('Full Service Wash', 700, 'Exterior wash + interior cleaning combo'),
        ('Deep Cleaning', 800, 'Thorough interior and exterior deep cleaning'),
        ('Premium Detailing', 1000, 'Complete premium cleaning with wax and protection')
      `);
      console.log('Default services inserted');
    }

    client.release();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

module.exports = { pool, initDatabase };
