const express = require("express");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const { upload } = require("./configs/multer-config");
const embedMessageInImage = require("./functions/embeding/messageEmbeder");
const encryption = require("./functions/embeding/encryption");
const decryption = require("./functions/retrieving/decryption");
const keyExtractor = require("./utils/keyExtractor");
const extractBinaryFromImage = require("./functions/retrieving/binaryRetriever");
const deleteAllFiles = require("./functions/deleteAllFiles");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
dotenv.config();

// Ensure 'uploads' and 'output' folders exist
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");
if (!fs.existsSync("./output")) fs.mkdirSync("./output");

app.post("/stegx", upload.single("image"), async (req, res) => {
  const image = req.file;
  const { text, action } = req.body;
  const inpImgPath = `./uploads/${image.filename}`;
  const outImgPath = `../output/${image.filename}`;

  if (action === "encrypt") {
    const { binaryDataArr, key } = encryption(text);
    await embedMessageInImage(inpImgPath, outImgPath, binaryDataArr);

    // Send the image as base64
    fs.readFile(outImgPath, (err, data) => {
      if (err) {
        console.error("Error reading output image:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to read output image" });
      }

      const base64Image = data.toString("base64");

      res.status(200).json({
        success: true,
        key,
        image: `data:image/png;base64,${base64Image}`,
      });
    });

    deleteAllFiles("./uploads");
  } else {
    try {
      const { ran, avg, len } = keyExtractor(text);
      const totalBits = len * 24;

      const bitStream = await extractBinaryFromImage(inpImgPath, totalBits);

      const message = decryption(bitStream, ran, avg, len);

      deleteAllFiles("./uploads");

      res.status(200).json({ success: true, message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
