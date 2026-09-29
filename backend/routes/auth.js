const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET, requireAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, name: user.name },
      SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, user: { username: user.username, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public registration creates read-only HQ accounts. Operator accounts remain
// provisioned by an administrator so public signup cannot grant write access.
router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (await User.findOne({ username })) {
      return res.status(409).json({ error: 'Username is already registered' });
    }

    const user = await User.create({
      name,
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'hq'
    });
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, name: user.name },
      SECRET,
      { expiresIn: '12h' }
    );
    res.status(201).json({
      token,
      user: { username: user.username, role: user.role, name: user.name }
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Username is already registered' });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - lets the frontend re-validate a stored token on refresh
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
