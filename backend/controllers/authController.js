const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Ortak kullanıcı response'u oluşturma
const createUserResponse = (user) => {
  return {
    success: true,
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      registrationMethod: user.registrationMethod,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  };
};

// Çift istekleri önlemek için
const lastRequestTimestamps = new Map();

exports.register = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, phone } = req.body;
    
    // Validasyon
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen tüm zorunlu alanları doldurun'
      });
    }
    
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        error: 'Şifreler eşleşmiyor'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır'
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Bu email adresi zaten kullanılıyor'
      });
    }
    
    const user = await User.create({
      name,
      email,
      phone,
      password,
      registrationMethod: 'email',
      lastLogin: new Date()
    });
    
    res.status(201).json(createUserResponse(user));
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Kayıt sırasında bir hata oluştu' : error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email ve şifre giriniz'
      });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı'
      });
    }
    
    // Google ile kayıtlı kullanıcı normal giriş yapmaya çalışıyorsa
    if (user.googleId && !user.password) {
      return res.status(401).json({
        success: false,
        error: 'Bu hesap Google ile kayıtlı. Lütfen Google ile giriş yapın.'
      });
    }
    
    // Şifre kontrolü
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı'
      });
    }
    
    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();
    
    res.json(createUserResponse(user));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Giriş sırasında bir hata oluştu' : error.message
    });
  }
};

// Google ile giriş için yardımcı fonksiyon
exports.googleLogin = async (req, res) => {
  try {
    // Son giriş tarihini güncelle
    req.user.lastLogin = new Date();
    await req.user.save();
    
    res.json(createUserResponse(req.user));
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Google girişi sırasında bir hata oluştu' : error.message
    });
  }
};

// Kullanıcı profilini getirme
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        registrationMethod: user.registrationMethod,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Profil getirme sırasında bir hata oluştu' : error.message
    });
  }
};

// Kullanıcı profilini güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        registrationMethod: user.registrationMethod,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Profil güncelleme sırasında bir hata oluştu' : error.message
    });
  }
};

// Zaman aşımına uğramış istek kayıtlarını temizleme
setInterval(() => {
  const now = Date.now();
  for (const [email, timestamp] of lastRequestTimestamps.entries()) {
    if (now - timestamp > 600000) { // 10 dakikadan eski kayıtları temizle
      lastRequestTimestamps.delete(email);
    }
  }
}, 300000); // 5 dakikada bir temizle