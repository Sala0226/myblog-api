const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api', require('./routes'));

// Export
module.exports = app;

