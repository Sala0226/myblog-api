const express = require('express');
const cors = require('cors');

const app = express();

const postRoutes = require('./routes/post.routes');

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api', require('./routes'));

//Post Routes
app.use('/api/posts', postRoutes);

// Export
module.exports = app;

