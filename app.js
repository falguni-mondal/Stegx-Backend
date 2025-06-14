const express = require("express");
const fs = require("fs");
const Jimp = require("jimp");
const cors = require("cors");
const dotenv = require("dotenv");
const { upload } = require("./configs/multer-config");
const keyGenerator = require("./utils/keyGenerator");
const twosComplement = require("./utils/twosComplement");
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials : true
 }));
app.use(express.urlencoded({ extended: true }));
dotenv.config();

// Ensure 'uploads' and 'output' folders exist
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");
if (!fs.existsSync("./output")) fs.mkdirSync("./output");


const embedMessageInImage = async (
  inputImagePath,
  outputImagePath,
  binaryDataArray
) => {
  const image = await Jimp.read(inputImagePath);
  let pixelIndex = 0;

  for (let binary of binaryDataArray) {
    for (let i = 0; i < 4; i++) {
      const x = pixelIndex % image.bitmap.width;
      const y = Math.floor(pixelIndex / image.bitmap.width);

      if (y >= image.bitmap.height) {
        throw new Error("Image too small to embed message.");
      }

      const idx = i * 6;
      const color = Jimp.intToRGBA(image.getPixelColor(x, y));

      const newR =
        (color.r & 0b11111100) | parseInt(binary.slice(idx, idx + 2), 2);
      const newG =
        (color.g & 0b11111100) | parseInt(binary.slice(idx + 2, idx + 4), 2);
      const newB =
        (color.b & 0b11111100) | parseInt(binary.slice(idx + 4, idx + 6), 2);

      image.setPixelColor(Jimp.rgbaToInt(newR, newG, newB, color.a), x, y);
      pixelIndex++;
    }
  }

  await image.writeAsync(outputImagePath);
};

app.post("/stegx", upload.single("image"), async (req, res) => {
  const image = req.file;
  const { text, action } = req.body;

  const randomNumber = Math.floor(Math.random() * 2 ** 24); // Range: 0 to 16777215
  const ran = randomNumber.toString(2).padStart(24, "0"); // Ensure 24 bits

  const asciiArr = text.split("").map((char) => char.charCodeAt(0));

  const avg = Math.floor(
    asciiArr.reduce((sum, num) => sum + num, 0) / asciiArr.length
  );

  const multiplied = asciiArr.map((ascii) => ascii * avg);

  const twosComplement24bit = twosComplement(ran);

  const DeciTwosCom = parseInt(twosComplement24bit, 2);

  const subtracted = multiplied.map((num) =>
    (DeciTwosCom - num).toString(2).padStart(24, "0")
  );

  const inpImgPath = `./uploads/${image.filename}`;
  const outImgPath = `./output/${image.filename}`;


  await embedMessageInImage(inpImgPath, outImgPath, subtracted);

  const key = keyGenerator(ran, avg, text.length);

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
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});