const { insertQuery, pool } = require('../../config/db');
const { generateToken } = require('./user.service');
const bcrypt = require("bcryptjs");


exports.login = async (req, res) => {  // ✅ Ensure function exists
    const { username, password } = req.body;
    try {
      const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
      if (result.rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });
  
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.hashed_password);
      if (!passwordMatch) return res.status(400).json({ message: "Invalid credentials" });
  
      const token = generateToken(user);
      res.json({ token, username: user.username, email: user.email, phone: user.phone, last_name: user.last_name, first_name: user.first_name});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


exports.addAdmin = async (req, res) => {  // ✅ Ensure functions exist
    const { username, password, first_name, last_name, email, phone } = req.body;
    console.log(username);
    const hashedPassword = await bcrypt.hash(password, 10);
    
  
    try {
      await pool.query("INSERT INTO admins (username, hashed_password, first_name, last_name, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6, 'admin')", [
        username,
        hashedPassword,
        first_name, last_name, email, phone
      ]);
      res.json({ message: "Admin added successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


  exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, password, first_name, last_name, email, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      await pool.query("UPDATE admins SET username = $1, hashed_password = $2, first_name = $3, last_name = $4, email = $5, phone = $6 WHERE id = $3 AND role = 'admin'", [
        username,
        hashedPassword,
        id,
        first_name, last_name, email, phone
      ]);
      res.json({ message: "Admin updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  exports.removeAdmin = async (req, res) => {
    const { id } = req.params;
  
    try {
      await pool.query("DELETE FROM admins WHERE id = $1 AND role = 'admin'", [id]);
      res.json({ message: "Admin removed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }