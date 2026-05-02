const User = require('../models/User');
const Post = require('../models/Post');

exports.getStats = async (req, res) => {
  try {
    console.log('getStats appelé par:', req.userId);
    
    const totalUsers    = await User.countDocuments();
    console.log('totalUsers:', totalUsers);
    
    const totalPosts    = await Post.countDocuments();
    const totalLikes    = await Post.aggregate([
      { $project: { count: { $size: { $ifNull: ['$likes', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const totalComments = await Post.aggregate([
      { $project: { count: { $size: { $ifNull: ['$comments', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const postsWithImage = await Post.countDocuments({ image: { $ne: null } });

    const userGrowth = await User.aggregate([
      { $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
          count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    const result = {
      totalUsers,
      totalPosts,
      totalLikes:    totalLikes[0]?.total    || 0,
      totalComments: totalComments[0]?.total || 0,
      postsWithImage,
      userGrowth
    };
    
    console.log('Stats result:', result);
    res.json(result);
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = search ? {
      $or: [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Ajoute le nombre de posts par user
    const usersWithStats = await Promise.all(users.map(async u => {
      const postCount    = await Post.countDocuments({ author: u._id });
      const likeCount    = await Post.aggregate([{ $match: { author: u._id } }, { $project: { count: { $size: '$likes' } } }, { $group: { _id: null, total: { $sum: '$count' } } }]);
      const commentCount = await Post.aggregate([{ $match: { author: u._id } }, { $project: { count: { $size: '$comments' } } }, { $group: { _id: null, total: { $sum: '$count' } } }]);
      return {
        ...u,
        postCount,
        likeCount:    likeCount[0]?.total    || 0,
        commentCount: commentCount[0]?.total || 0,
      };
    }));

    res.json({
      users: usersWithStats,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 6;
    const skip   = (page - 1) * limit;
    const search = req.query.search || '';

    // ← Filtre clé : exclure les posts privés des autres
    let filter = {
      $or: [
        { isPublic: true },
        { isPublic: { $exists: false } },
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
              { isPublic: { $exists: false } },
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
    console.error('getPosts error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getImages = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip  = (page - 1) * limit;

    const total = await Post.countDocuments({ image: { $ne: null } });
    const posts = await Post.find({ image: { $ne: null } })
      .populate('author', 'name avatar')
      .select('image title author createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Avatars aussi
    const avatars = await User.find({ avatar: { $ne: null } })
      .select('name avatar createdAt')
      .lean();

    res.json({
      postImages: posts,
      avatars,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    await Post.deleteMany({ author: userId });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};