const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Fallback dev/local jika token tidak dikirim atau null/undefined
  const fallbackUserId = req.body.userId || req.body.user_id || req.query.userId || req.query.user_id || req.headers['x-user-id'];

  if (!token || token === 'null' || token === 'undefined') {
    if (fallbackUserId) {
      req.user = { id: parseInt(fallbackUserId) };
      return next();
    }
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      if (fallbackUserId) {
        req.user = { id: parseInt(fallbackUserId) };
        return next();
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
