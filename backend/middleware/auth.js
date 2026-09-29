const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// Verifies the Bearer token on every protected request and attaches
// { id, username, role } to req.user. Rejects with 401 if missing/invalid.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Restricts a route to specific roles, e.g. requireRole('operator').
// HQ users can look at everything but this blocks them from writing.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, SECRET };
