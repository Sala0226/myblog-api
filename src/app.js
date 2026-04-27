const express = require('express');
const cors = require('cors');

const app = express();

const postRoutes = require('./routes/post.routes'); 

const userRoutes = require('./routes/user.routes');

// Middlewares
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'https://myblog-frontend-sable.vercel.app' 
  ],
  credentials: true 
}));

app.use(express.json());

// Routes
app.use('/api', require('./routes'));

//Post Routes
app.use('/api/posts', postRoutes);

// Export
module.exports = app; 

//Users Routes Cloud Images
app.use('/api/users', userRoutes);

