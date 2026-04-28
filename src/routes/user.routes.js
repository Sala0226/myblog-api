const express = require('express');
const router  = express.Router();
const { updateAvatar, deleteAvatar, getProfile  } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../config/cloudinary');

router.get('/profile',              verifyToken, getProfile);
router.put('/avatar', verifyToken,  uploadAvatar.single('avatar'), updateAvatar);
router.delete('/avatar', verifyToken, deleteAvatar);

module.exports = router;