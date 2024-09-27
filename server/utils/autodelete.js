import { promises as fs, stat } from "fs";
import path from "path";

// Equivalent of __dirname in ES modules
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory where uploaded files are stored
// Helper function to delete files older than 5 minutes
async function deleteOldFiles(uploadDir) {
  try {
    // Read all files in the uploads directory
    const files = await fs.readdir(uploadDir);
    console.log(files);
    const now = Date.now(); // Current time

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadDir, file);
        console.log(filePath);
        // Get file stats
        const stats = await fs.stat(filePath);
        console.log(stats);
        const fileCreationTime = new Date(stats.birthtime).getTime();
        const fileAgeInMinutes = (now - fileCreationTime) / (1000 * 60); // Convert milliseconds to minutes

        // If the file is older than 5 minutes, delete it
        if (fileAgeInMinutes > 5) {
          console.log(`Deleting file: ${file}`);
          await fs.unlink(filePath); // Delete the file
        }
      })
    );

    console.log("Old files deleted if any.");
  } catch (err) {
    console.error("Error accessing or deleting files:", err);
  }
}

// Call the function to delete old files
export default deleteOldFiles;
