require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/bd"); 


const app = express();

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const taskRoutes = require("./routes/taskRoutes");
const auditRoutes = require("./routes/auditRoutes");
const actionLogRoutes = require("./routes/actionLogRoutes");
const outcomeRoutes = require("./routes/outcomeRoutes");
const userRoutes = require("./routes/userRoutes");
const capRoutes = require("./routes/capRoutes");
const ncRoutes = require("./routes/nonConformityRoutes");
const strengthRoutes = require("./routes/strengthRoutes");
const sensitivePointRoutes = require("./routes/sensitivePointRoutes");
const ofiRoutes =  require("./routes/ofiRoutes");
const commentRoutes = require('./routes/commentRoutes');




//  Routes
app.use('/uploads', express.static('uploads'));

app.use("/api/audit", auditRoutes);
app.use("/api/task", taskRoutes);

app.use("/api/outcome", outcomeRoutes);
app.use("/api/sensitivePoint", sensitivePointRoutes);
app.use("/api/strength", strengthRoutes);
app.use("/api/ofi", ofiRoutes);
app.use("/api/nonConformity", ncRoutes);
app.use("/api/cap", capRoutes);
app.use('/api/comments', commentRoutes);

app.use("/api/user", userRoutes);
app.use("/api/actionLog", actionLogRoutes);



app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

module.exports = app;
