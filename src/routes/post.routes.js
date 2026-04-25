const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, postController.getPosts);
router.post('/', verifyToken, postController.createPost);
router.post('/:id/like', verifyToken, postController.likePost);
router.post('/:id/comment', verifyToken, postController.commentPost);

module.exports = router;