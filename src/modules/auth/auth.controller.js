const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { insertQuery, pool } = require("../../config/db");
const authService = require("./auth.service");
const { redisClient } = require("../../config/redisClient");

const JWT_SECRET = process.env.JWT_SECRET;

const REDIS_PREFIX = "gnm_";

const loginWithGoogle = async (req, res) => {
  const { token } = req.body;
  const googleUser = await authService.verifyToken(token);
  if (!(googleUser && googleUser.sub)) {
    return Promise.reject(
      `Error fetching google user: ${JSON.stringify(googleUser)}`
    );
  }
  const authInfo = {
    google_id: googleUser.sub,
    google_name: googleUser.name,
    last_name: googleUser.family_name,
    first_name: googleUser.given_name,
    email: googleUser.email,
  };
  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE google_id = $1",
      [googleUser.sub]
    );
    if (result.rows.length === 0) {
      const response = await pool.query(
        "INSERT INTO members (google_id, email, last_name, first_name, display_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          googleUser.sub,
          googleUser.email,
          googleUser.family_name,
          googleUser.given_name,
          googleUser.name,
        ]
      );
      console.log(response);
      authInfo.id = response.rows[0].id;
      authInfo.new_user = true;
    } else {
      authInfo.id = result.rows[0].id;
      authInfo.first_name = result.rows[0].first_name;
      authInfo.last_name = result.rows[0].last_name;
      authInfo.display_name = result.rows[0].display_name;
      authInfo.email = result.rows[0].email;
    }
  } catch (err) {
    console.error("Login failed:", err);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
  const accessData = await generateAccessToken(authInfo);
  res.json({ success: true, user: accessData });
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members WHERE id = $1", [
      req.user.id,
    ]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
};

const generateAccessToken = async (authInfo) => {
  const tokenKey = randomUUID();
  const token = jwt.sign({ id: authInfo.id }, process.env.AUTH_SECRET || "");
  await redisClient.set(`${REDIS_PREFIX}${tokenKey}`, token, {
    EX: 3600, // expires in seconds
  });

  return {
    ...authInfo,
    access_token: tokenKey,
  };
};

module.exports = {
  loginWithGoogle,
  logout,
  getCurrentUser,
};
