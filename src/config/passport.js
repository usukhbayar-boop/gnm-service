// File: config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./database');
require('dotenv').config();

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in database
        const existingUserResult = await pool.query(
          'SELECT * FROM members WHERE google_id = $1',
          [profile.id]
        );
        
        if (existingUserResult.rows.length > 0) {
          // User exists, return user
          return done(null, existingUserResult.rows[0]);
        }
        
        // User doesn't exist, create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const phone = profile.phones && profile.phones[0] ? profile.phones[0].value : null;
        const pictureUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        
        const newUserResult = await pool.query(
          'INSERT INTO members (google_id, display_name, email, profile_picture, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [profile.id, profile.displayName, email, pictureUrl, phone]
        );
        
        return done(null, newUserResult.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      done(null, result.rows[0]);
    } else {
      done(new Error('Member not found'));
    }
  } catch (err) {
    done(err);
  }
});

module.exports = passport;