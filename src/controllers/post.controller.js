const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .lean(); // ← retourne des objets JS purs

    // Sécurise chaque post
    const safePosts = posts.map(post => ({
      ...post,
      likes: Array.isArray(post.likes) ? post.likes.filter(Boolean) : [],
      comments: Array.isArray(post.comments) ? post.comments.filter(Boolean) : [],
    }));

    res.json(safePosts);
  } catch (err) {
    console.error('getPosts error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }
    const post = await Post.create({
      title,
      content,
      author: req.userId,
      likes: [],
      comments: []
    });
    const populated = await Post.findById(post._id)
      .populate('author', 'name email')
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    console.error('createPost error:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });

    if (!post.likes) post.likes = [];

    const index = post.likes.findIndex(id => id.toString() === req.userId.toString());
    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .lean();

    res.json({
      ...populated,
      likes: populated.likes || [],
      comments: populated.comments || []
    });
  } catch (err) {
    console.error('likePost error:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Contenu requis' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });

    if (!post.comments) post.comments = [];
    post.comments.push({ user: req.userId, content });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'name email')
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .lean();

    res.json({
      ...populated,
      likes: populated.likes || [],
      comments: populated.comments || []
    });
  } catch (err) {
    console.error('commentPost error:', err);
    res.status(400).json({ message: err.message });
  }
};