const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

exports.verifyAdmin = async (req, res, next) => {
  try {
    console.log('ADMIN_EMAIL from env:', process.env.ADMIN_EMAIL);
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    console.log('User email:', user?.email);
    console.log('Match:', user?.email === process.env.ADMIN_EMAIL);
    
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};