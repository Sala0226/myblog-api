const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadPost }  = require('../config/cloudinary');

router.get('/', verifyToken, postController.getPosts);
router.post('/', verifyToken, (req, res, next) => {
  uploadPost.single('image')(req, res, (err) => {
    if (err) {
      console.error('ERREUR MULTER/CLOUDINARY:', err.message, err.stack);
      return res.status(500).json({ message: 'Erreur upload: ' + err.message });
    }
    next();
  });
}, postController.createPost);
router.put('/:id',    verifyToken, uploadPost.single('image'), postController.updatePost);
router.delete('/:id', verifyToken, postController.deletePost);
router.post('/:id/like', verifyToken, postController.likePost);
router.post('/:id/comment', verifyToken, postController.commentPost);
router.put('/:id/comment/:commentId', verifyToken, postController.updateComment);
router.get('/user/:userId', verifyToken, postController.getPostsByUser);
router.put('/:id/visibility', verifyToken, postController.toggleVisibility);

module.exports = router;