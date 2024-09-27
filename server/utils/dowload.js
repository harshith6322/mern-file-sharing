import express from "express";
import fs from "fs";
import path from "path";
import archiver from "archiver";

async function zip(fileRecord, res, id) {
  if (!fileRecord) {
    return res.status(404).json({ error: "File not found." });
  }

  const filePaths = fileRecord.path; // Array of file paths
  const originalNames = fileRecord.originalName; // Array of original names

  if (filePaths.length === 1) {
    // Single file download case
    const filePath = path.resolve(filePaths[0]);
    const originalName = originalNames[0];

    if (fs.existsSync(filePath)) {
      res.download(filePath, originalName, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).json({ error: "Could not download the file." });
        }
      });
    } else {
      res.status(404).json({ error: "File not found on the server." });
    }
  } else {
    // Multiple files case: zip them and download
    const archive = archiver("zip", { zlib: { level: 9 } });
    const zipFilename = `files-${id}.zip`;
    const zipFilePath = path.resolve("downloads", zipFilename); // Ensure 'downloads' directory exists

    // Ensure 'downloads' directory exists
    const downloadsDir = path.resolve("downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const output = fs.createWriteStream(zipFilePath);

    output.on("close", () => {
      console.log(`${archive.pointer()} total bytes`);
      res.download(zipFilePath, zipFilename, (err) => {
        if (err) {
          console.error("Error downloading zip file:", err);
          res.status(500).json({ error: "Could not download the zip file." });
        }
        // Optionally, delete the zip file after download to clean up
        fs.unlinkSync(zipFilePath);
      });
    });

    archive.pipe(output);

    // Add each file to the zip
    filePaths.forEach((filePath, index) => {
      const fullFilePath = path.resolve(filePath);
      const originalName = originalNames[index];
      if (fs.existsSync(fullFilePath)) {
        archive.file(fullFilePath, { name: originalName });
      } else {
        console.warn(`File not found: ${fullFilePath}`);
      }
    });

    // Finalize the archive
    await archive.finalize();
  }
}

export default zip;
