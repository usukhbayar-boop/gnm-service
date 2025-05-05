// auth/auth.service.js
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    googleId: payload.sub,
  };
}

async function findOrCreateUser(googleUser) {
  let user = await findOneByGoogleId(googleUser.googleId);

  if (!user) {
    user = await createMember(googleUser);
  }

  return user;
}

async function findOneByGoogleId(googleId) {
  const result = await pool.query(
    'SELECT * FROM members WHERE google_id = $1 LIMIT 1',
    [googleId]
  );
  return result.rows[0];
}

async function createMember(member) {
  const {
    google_id,
    display_name,
    email,
    profile_picture,
    phone,
    is_verified_member = false,
  } = member;

  const result = await pool.query(
    `INSERT INTO members (google_id, display_name, email, profile_picture, phone, is_verified_member)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [google_id, display_name, email, profile_picture, phone, is_verified_member]
  );

  return result.rows[0];
}




module.exports = {
  verifyGoogleToken,
  findOrCreateUser,
};
