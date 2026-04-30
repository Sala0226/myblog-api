const authService = require('../services/auth.service');

const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const emailService = require('../services/email.service');

exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body);

    res.json({
      message: 'Login successful',
      ...data,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Email reçu:', email);
    
    const user = await User.findOne({ email });
    console.log('User trouvé:', user ? 'oui' : 'non');
    
    if (!user) return res.status(404).json({ message: 'Email introuvable' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    console.log('Token sauvegardé');

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log('Reset URL:', resetUrl);
    
    await emailService.sendResetEmail(email, resetUrl);
    console.log('Email envoyé');

    res.json({ message: 'Email de réinitialisation envoyé !' });
  } catch (err) {
    console.error('ERREUR forgotPassword:', err.message);
    console.error('STACK:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token invalide ou expiré' });

    user.password             = await bcrypt.hash(password, 10);
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès !' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
