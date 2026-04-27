const User = require('../models/User');

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

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};