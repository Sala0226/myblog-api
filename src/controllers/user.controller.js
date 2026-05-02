const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie' });

    console.log('File reçu:', req.file);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: req.file.path },
      { new: true, select: '-password' }
    );

    res.json({ message: 'Avatar mis à jour', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: '' },
      { new: true, select: '-password' }
    );
    res.json({ message: 'Avatar supprimé', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Mot de passe mis à jour !' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};