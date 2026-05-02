const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 6;
    const skip   = (page - 1) * limit;
    const search = req.query.search || '';

    const userId = req.userId?.toString();

    let filter = {
      $or: [
        { isPublic: true },
        { author: req.userId }
      ]
    };

    if (search) {
      const User = require('../models/User');
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      filter = {
        $and: [
          {
            $or: [
              { isPublic: true },
              { author: req.userId }
            ]
          },
          {
            $or: [
              { title:   { $regex: search, $options: 'i' } },
              { content: { $regex: search, $options: 'i' } },
              { author:  { $in: userIds } }
            ]
          }
        ]
      };
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const safePosts = posts.map(post => ({
      ...post,
      likes:    Array.isArray(post.likes)    ? post.likes.filter(Boolean) : [],
      comments: Array.isArray(post.comments) ? post.comments.filter(Boolean) : [],
    }));

    res.json({
      posts: safePosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('getPosts error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
exports.createPost = async (req, res) => {
  try {
     console.log('Body reçu:', req.body);
    console.log('File reçu:', req.file);
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }

    const post = await Post.create({
      title,
      content,
      image:    req.file ? req.file.path : '',
      author:   req.userId,
      likes:    [],
      comments: []
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .lean();

    res.status(201).json(populated);
  } catch (err) {
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
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
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
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
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

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Contenu requis' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable' });

    // Vérifie que c'est bien le bon user
    if (comment.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    comment.content = content;
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .lean();

    res.json({
      ...populated,
      likes:    populated.likes    || [],
      comments: populated.comments || []
    });
  } catch (err) {
    console.error('updateComment error:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    post.title   = req.body.title   || post.title;
    post.content = req.body.content || post.content;
    if (req.file) post.image = req.file.path;
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .lean();

    res.json({ ...populated, likes: populated.likes || [], comments: populated.comments || [] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post supprimé' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { visibility } = req.query; // 'public' ou 'all'
    
    let filter = { author: userId };
    
    // Si c'est pas le propriétaire, seulement les posts publics
    if (req.userId !== userId) {
      filter.isPublic = true;
    }

    const posts = await Post.find(filter)
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    const safePosts = posts.map(post => ({
      ...post,
      likes:    Array.isArray(post.likes)    ? post.likes.filter(Boolean) : [],
      comments: Array.isArray(post.comments) ? post.comments.filter(Boolean) : [],
    }));

    res.json(safePosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    post.isPublic = !post.isPublic;
    await post.save();
    res.json({ isPublic: post.isPublic });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};