import dotenv from "dotenv";
dotenv.config();
import express, { json } from "express";
import cors from "cors";

import router from "./routes/mainRoute.js";
import deleteOldFiles from "./utils/autodelete.js";
import { promises as fs } from "fs";
import path from "path";

// Equivalent of __dirname in ES modules
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(json());
app.use(cors());
app.use("/api/v1", router);
const PORT = process.env.PORT || 3000;
// console.log(PORT);
const uploadDir = path.join(__dirname, "uploads");
console.log(uploadDir);

// Run the deleteOldFiles function every minute
setInterval(() => {
  deleteOldFiles(uploadDir);
  console.log("hi");
}, 60 * 1000); // 60 seconds * 1000 milliseconds = 1 minute

app.get("/", (req, res) => {
  res.send("server is good");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/api/v1`);
});
