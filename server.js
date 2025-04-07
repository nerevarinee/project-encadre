// server.js (Main entry point)
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);


//mongodb connectiong
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

