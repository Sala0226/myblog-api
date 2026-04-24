const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
// router.use('/posts', require('./post.routes'));

module.exports = router;