require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/bd");

const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Gestion des fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import des routes
const taskRoutes = require("./routes/taskRoutes");
const auditRoutes = require("./routes/auditRoutes");
const actionLogRoutes = require('./routes/actionLogRoutes'); // ✅ correction ici
const outcomeRoutes = require("./routes/outcomeRoutes");
const userRoutes = require("./routes/userRoutes");
const capRoutes = require("./routes/capRoutes");
const ncRoutes = require("./routes/nonConformityRoutes");
const strengthRoutes = require("./routes/strengthRoutes");
const sensitivePointRoutes = require("./routes/sensitivePointRoutes");
const ofiRoutes = require("./routes/ofiRoutes");

// Déclaration des routes
app.use("/api/audit", auditRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/outcome", outcomeRoutes);
app.use("/api/sensitivePoint", sensitivePointRoutes);
app.use("/api/strength", strengthRoutes);
app.use("/api/ofi", ofiRoutes);
app.use("/api/nonConformity", ncRoutes);
app.use("/api/cap", capRoutes);
app.use('/api/comment', commentRoutes);

app.use("/api/user", userRoutes);
app.use("/api/action-logs", actionLogRoutes); // ✅ ici aussi correction du nom

// Middleware pour les erreurs
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

module.exports = app;
