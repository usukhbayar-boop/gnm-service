require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const cors = require("cors");


// Generate JWT Token
exports.generateToken = (user) => {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role, // Hasura requires role-based claims
      },
      'ea3bd136b38795eed6476cbf01606bbd95e4fe5475ed3a7c40a6d226ef482d2b84737c3bf45aa91dfe28a8d692059dc76f811b9b633c259b2ec2a19f63d0e8c35e438f488827000dbd50d00257282e811f296b6a3fac8b5342ef1f91dd775bf7a856f50b6b3094b2747c13f2e5de07b15f5d708ac9f1e992d35d2bf3c595747f689b081dba3ff441f3109808fa209985079d06683287f49e3babaa7fdb28d3a76c91e080ecf0150a166ea063f082f901e7b0add761978b336f857bfacb7673a5403138277277a5fa5ae28f8fb24b198c16a5b268c979a3b553c9329a3869f99bb65fb0f6c68b9c885e8b0e43bb032339150fef3b8295e6b68a9d4af8e79afddb',
      { expiresIn: "1h" }
    );
  };
  
  // Middleware for protecting routes
  exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = decoded;
      next();
    });
  };
  
  // Admin-only middleware
  exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
    next();
  };