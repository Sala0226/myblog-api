const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

exports.verifyAdmin = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    
    // Hardcode temporairement pour tester
    const ADMIN_EMAIL = 'admin@gmail.com';
    
    console.log('User email:', user.email);
    console.log('Admin email:', ADMIN_EMAIL);
    console.log('Match:', user.email === ADMIN_EMAIL);
    
    if (user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};