import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

// Connect to MongoDB
console.log(process.env.DATABASE_URL);
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Database is good"))
  .catch((err) => console.log("Database is down: " + err));

// Define the file sharing schema
const fileSharingSchema = new mongoose.Schema({
  path: {
    type: [String],
    required: true,
  },
  originalName: {
    type: [String],
    required: true,
  },
  password: {
    type: String,
    // You can add a default value or required if needed
  },
  downloadCount: {
    type: Number,
    required: true,
    default: 0, // Default to 0 if not provided
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 360,
  },
});

// Create the model
const DbFile = mongoose.model("DbFile", fileSharingSchema);

// Export the model
export default DbFile;
