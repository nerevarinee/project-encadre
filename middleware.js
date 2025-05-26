const jwt = require("jsonwebtoken");
const { User } = require("./models");

// Middleware to authenticate users
exports.authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.status(401).json({ msg: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.user = await User.findById(decoded.id).select("-password"); // Attach user to request
    if (!req.user) return res.status(401).json({ msg: "Invalid token" });
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// Middleware to verify user roles (Replaces all verifyRole functions)
exports.verifyRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token)
        return res.status(401).json({ msg: "No token, authorization denied" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ msg: "Access denied" });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ msg: "Invalid token" });
    }
  };
};
