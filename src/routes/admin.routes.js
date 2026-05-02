const express = require('express');
const router  = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyAdmin } = require('../middlewares/admin.middleware');

router.get('/stats',              verifyToken, verifyAdmin, adminController.getStats);
router.get('/users',              verifyToken, verifyAdmin, adminController.getUsers);
router.get('/posts',              verifyToken, verifyAdmin, adminController.getPosts);
router.get('/images',             verifyToken, verifyAdmin, adminController.getImages);
router.delete('/users/:userId',   verifyToken, verifyAdmin, adminController.deleteUser);
router.delete('/posts/:postId',   verifyToken, verifyAdmin, adminController.deletePost);

module.exports = router;