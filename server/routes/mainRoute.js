import express from "express";
import multer from "multer";
import DbFile from "../model/db.js";
import bcrypt from "bcrypt";
import zip from "../utils/dowload.js";

const upload = multer(
  { dest: "uploads/" },
  {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB in bytes
    },
  }
);

const router = express.Router();

router.get("/", (req, res) => {
  res.send("server good");
});

router.post("/upload", upload.array("file", 6), async (req, res) => {
  try {
    const { password } = req.body;
    console.log(password);
    let hashpassword;
    if (password && password.trim() !== "") {
      hashpassword = await bcrypt.hash(password, 10);
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // Create an array to hold file data
    const filedata = req.files.map((file) => ({
      path: file.path,
      originalname: file.originalname,
    }));

    const db1 = await DbFile.create({
      path: filedata.map((f) => f.path),
      originalName: filedata.map((f) => f.originalname),
      password: hashpassword,
    });

    res.status(200).json({
      error: false,
      url: `http://localhost/dowload?id=${db1._id}`,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      msg: "some thing went wrong" + err,
    });
  }
});

router.get("/download", async (req, res) => {
  const id = req.query.id; // Access the id directly from req.query
  const password = req.body.password;
  if (!id) {
    return res.status(400).json({ error: "ID is required." });
  }

  try {
    // Find the file record in the database using the ID
    const fileRecord = await DbFile.findById(id);

    // Check if file record exists
    if (!fileRecord) {
      return res
        .status(404)
        .json({ error: true, msg: "File not found or expired." });
    }

    const passowrddb = fileRecord.password;
    async function inc() {
      await DbFile.findByIdAndUpdate(
        { _id: id },
        { $inc: { downloadCount: 1 } }
      );
    }
    // If no password was set for the file
    if (!passowrddb || passowrddb === "") {
      inc();
      zip(fileRecord, res, id); // No password protection, proceed to download
    } else {
      // If the file has a password, check the provided password
      if (!password) {
        return res.status(400).json({
          error: true,
          msg: "Password is required to download the file.",
        });
      }

      const compass = await bcrypt.compare(password, passowrddb);

      if (compass) {
        inc();
        zip(fileRecord, res, id); // Password matches, proceed to download
      } else {
        return res.status(401).json({
          error: true,
          msg: "Wrong password",
        });
      }
    }
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
