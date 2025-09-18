const express = require('express');
const { register,login,googleLogin,getProfile,updateProfile} = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Erişim tokenı gerekiyor'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Geçersiz token'
      });
    }
    req.user = user;
    next();
  });
};

router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login.html?error=Google+girişi+başarısız',
    session: false
  }),
  async (req, res) => {
    try {
      console.log('Google authentication successful, user:', req.user);
      
      if (!req.user || !req.user._id) {
        console.error('Kullanıcı bilgileri eksik:', req.user);
        return res.redirect('/login.html?error=Kullanıcı+bilgileri+alınamadı');
      }
      
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const userData = {
        id: req.user._id,
        name: req.user.name || 'Kullanıcı',
        email: req.user.email || '',
        phone: req.user.phone || '',
        role: req.user.role || 'user',
        emailVerified: req.user.emailVerified || true,
        registrationMethod: req.user.registrationMethod || 'google',
        createdAt: req.user.createdAt ? req.user.createdAt.toISOString() : new Date().toISOString()
      };
      
      console.log('Google ile giriş başarılı:', userData.email);
      
      const encodedUser = encodeURIComponent(JSON.stringify(userData));
      
      res.redirect(`/login.html?token=${token}&user=${encodedUser}`);
      
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect('/login.html?error=Google+ile+giriş+sırasında+teknik+bir+hata+oluştu');
    }
  }
);

router.post('/google', 
  passport.authenticate('google-token', { session: false }),
  googleLogin
);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Çıkış başarılı'
  });
});

router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API sorusuz çalışıyor',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;