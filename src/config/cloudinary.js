const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'myblog-posts',
    resource_type: 'image',
  })
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'myblog-avatars',
    resource_type: 'image',
  })
});

const uploadPost   = multer({ storage: postStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { cloudinary, uploadPost, uploadAvatar };