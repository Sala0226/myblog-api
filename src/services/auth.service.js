const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (data) => {
  const { name, email, password } = data;

  // Vérifier si user existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Création user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

exports.loginUser = async (data) => {
  const { email, password } = data;
  const user = await User.findOne({ email });
  if (!user) throw new Error('Utilisateur introuvable');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Mot de passe incorrect');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Ne jamais envoyer le password !
  const { password: _, ...userWithoutPassword } = user.toObject();

  return { token, user: userWithoutPassword };
};