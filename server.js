const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();
connectDB();


const PORT = process.env.PORT || 5000;

app.listen(5000, () => console.log('Server running on port 5000'));