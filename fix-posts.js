const mongoose = require('mongoose');

// Mets ton URI MongoDB directement ici
const MONGODB_URI = 'mongodb+srv://salalearn12_db_user:passer123@cluster0.efjl4ns.mongodb.net/';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('MongoDB connecté');
  const Post = require('./src/models/Post');
  
  const result = await Post.updateMany(
    { isPublic: { $exists: false } },
    { $set: { isPublic: true } }
  );
  
  console.log('Posts mis à jour:', result.modifiedCount);
  process.exit();
}).catch(err => {
  console.error('Erreur:', err.message);
  process.exit(1);
});