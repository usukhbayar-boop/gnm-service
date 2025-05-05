// queries/userQueries.js
const pool = require("../../config/db");

// Get all users
const getUsers = async () => {
  const res = await pool.query("SELECT * FROM users");
  return res.rows;
};

// Get user by ID
const getUserById = async (id) => {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
};

// Create user
const createUser = async (name, email) => {
  const res = await pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  return res.rows[0];
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
