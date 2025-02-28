const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./backend/config/config");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

// Importer les routes
const authRoutes = require("./backend/routes/authroutes"); 

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
