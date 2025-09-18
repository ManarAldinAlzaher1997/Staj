const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google Profile Received:', {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
      
      let user = await User.findOne({ 
        $or: [
          { email: profile.emails[0].value },
          { googleId: profile.id }
        ]
      });
      
      console.log('User found in DB:', user);
      
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          password: undefined,
          emailVerified: true,
          registrationMethod: 'google',
          lastLogin: new Date()
        });
        console.log('Yeni Google kullanıcısı oluşturuldu:', user.email);
      } else {
        if (!user.googleId) {
          user.googleId = profile.id;
        }
        user.lastLogin = new Date();
        user.emailVerified = true;
        user.registrationMethod = 'google';
        await user.save();
        console.log('Mevcut kullanıcı güncellendi:', user.email);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google Strategy Error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

app.use(express.static(path.join(__dirname, '../frontend')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lokanta', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Lokanta API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

app.use('/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/admin', require('./routes/admin'));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.startsWith('/admin/') || req.path.startsWith('/uploads/')) {
    return res.status(404).json({ success: false, error: 'Endpoint bulunamadı' });
  }
  
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use((error, req, res, next) => {
  console.error('Hata:', error);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Sunucu hatası' : error.message 
  });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
    return res.status(404).json({ success: false, error: 'Endpoint bulunamadı' });
  }
  res.status(404).send('Sayfa bulunamadı');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/status`);
  console.log(`Google OAuth: http://localhost:${PORT}/auth/google`);
  console.log(`JWT Secret: ${process.env.JWT_SECRET ? '✓ Ayarlı' : '✗ Eksik'}`);
  console.log(`JWT Expires In: ${process.env.JWT_EXPIRES_IN || '3d'}`);
});