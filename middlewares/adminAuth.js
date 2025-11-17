const jwt = require("jsonwebtoken");

exports.adminCheckAuth = (req, res, next) => {
  // Read token from cookie instead of header
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, admin unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Not admin",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};
