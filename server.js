const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./backend/config/config");
require("dotenv").config();

const app = express();
app.use(express.json());
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
