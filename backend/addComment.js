const mongoose = require("mongoose");

// Replace with your actual MongoDB Atlas connection string
const MONGO_URI = "mongodb+srv://aramdahmeni10:admin@project.tojmv.mongodb.net/project?retryWrites=true&w=majority&appName=project";

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const auditSchema = new mongoose.Schema({}, { strict: false });
const Audit = mongoose.model("Audit", auditSchema, "audits"); // Replace 'audits' with your collection name

async function addCommentField() {
  try {
    const result = await Audit.updateMany({}, { $set: { comment: "No comment available" } });
    console.log(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error("Error updating documents:", error);
  } finally {
    mongoose.connection.close();
  }
}

addCommentField();
