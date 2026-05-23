const express = require('express');
const router = express.Router();
const pool = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/signup
 * Register a new user
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "secure_password",
 *   "first_name": "John",
 *   "last_name": "Doe"
 * }
 */
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Get default user role ID
    const roleResult = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      ['user']
    );

    if (roleResult.rows.length === 0) {
      return res.status(500).json({ error: 'Default role not found' });
    }

    const role_id = roleResult.rows[0].id;

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role_id`,
      [email.toLowerCase(), password_hash, first_name || null, last_name || null, role_id]
    );

    const newUser = result.rows[0];

    // Get role name for token
    const roleQuery = await pool.query(
      'SELECT name FROM roles WHERE id = $1',
      [newUser.role_id]
    );

    const role_name = roleQuery.rows[0].name;

    // Generate token
    const token = generateToken({
      ...newUser,
      role_name
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: role_name
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "secure_password"
 * }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, 
              u.role_id, r.name as role_name, u.is_active
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role_name
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token invalidation)
 * Note: Token is invalidated client-side. For server-side logout, implement token blacklist.
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client.'
  });
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, r.name as role, 
              u.is_active, u.created_at, u.last_login
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile (email, name)
 */
router.put('/profile', authenticateToken, async (req, res) => {
  const { first_name, last_name, email } = req.body;
  const userId = req.user.id;

  try {
    // Check if new email is already taken
    if (email && email !== req.user.email) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name`,
      [first_name || null, last_name || null, email ? email.toLowerCase() : null, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/password
 * Change user password
 */
router.put('/password', authenticateToken, async (req, res) => {
  const { old_password, new_password, confirm_password } = req.body;
  const userId = req.user.id;

  if (!old_password || !new_password || !confirm_password) {
    return res.status(400).json({ error: 'All password fields are required' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Get current user password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isOldPasswordValid = await comparePassword(old_password, userResult.rows[0].password_hash);
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const new_password_hash = await hashPassword(new_password);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [new_password_hash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
