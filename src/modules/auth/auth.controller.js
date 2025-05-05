const jwt = require('jsonwebtoken');
const authService = require('./auth.service');

const JWT_SECRET = process.env.JWT_SECRET;

const loginWithGoogle = async (req, res) => {
  const { token } = req.body;

  try {
    const googleUser = await authService.verifyGoogleToken(token);
    const user = await authService.findOrCreateUser(googleUser);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
};

const getCurrentUser = (req, res) => {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
};

module.exports = {
  loginWithGoogle,
  logout,
  getCurrentUser,
};
