// middleware.js (Authentication & Role Middleware)
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const roleMiddleware = role => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ msg: 'Access denied' });
  next();
};

module.exports = { authMiddleware, roleMiddleware };
