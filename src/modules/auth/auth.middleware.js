const jwt = require("jsonwebtoken");
const { redisClient } = require("../../config/redisClient.js");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const tokenKey = req.headers.authorization?.replace("Bearer ", "");
    if (!tokenKey) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = await redisClient.get(`gnm_${tokenKey}`);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const user = jwt.verify(token, process.env.AUTH_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
