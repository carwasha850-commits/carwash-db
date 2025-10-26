const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();

// Middleware to verify JWT token and admin role
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    next();
  });
};

// Get all users with booking counts (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.phone,
        u.role,
        u.created_at,
        COUNT(b.id) as total_bookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.username, u.email, u.full_name, u.phone, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user by ID (admin only)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.phone,
        u.role,
        u.created_at,
        COUNT(b.id) as total_bookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.email, u.full_name, u.phone, u.role, u.created_at
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
