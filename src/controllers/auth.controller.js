const authService = require('../services/auth.service');

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
