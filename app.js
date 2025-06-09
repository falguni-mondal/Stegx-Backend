const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const crypto = require('crypto');
const app = express();
const upload = multer({ dest: 'uploads/' });


app.use(express.urlencoded({extended : true}));

// Helper to convert decimal to binary with padding
const toBinary = (num, bits) => num.toString(2).padStart(bits, '0');
const fromBinary = (bin) => parseInt(bin, 2);

// Generate 24-bit random binary string
const getRandom24Bit = () => crypto.randomBytes(3).toString('hex');

// Convert message to ASCII array
const messageToAscii = (msg) => Array.from(msg).map(c => c.charCodeAt(0));

// Embed data in image
const embedData = async (imagePath, message) => {
  const image = await Jimp.read(imagePath);
  const asciiArr = messageToAscii(message);
  const avg = Math.round(asciiArr.reduce((a, b) => a + b, 0) / asciiArr.length);
  const arr = asciiArr.map(v => v * avg);

  const ranHex = getRandom24Bit();
  const ranBin = parseInt(ranHex, 16).toString(2).padStart(24, '0');
  const ranDec = parseInt(ranBin, 2);
  const ranComp = (~ranDec + 1 >>> 0).toString(2).padStart(24, '0');

  const arr2 = arr.map(num => toBinary(num, 16));
  const arr3 = arr2.map(b => {
    const bDec = parseInt(b, 2);
    const diff = (parseInt(ranComp, 2) - bDec) >>> 0;
    return toBinary(diff, 24);
  });

  let pixelIndex = 0;
  for (const bin of arr3) {
    for (let i = 0; i < 24; i += 6) {
      const chunk = bin.slice(i, i + 6);
      const x = pixelIndex % image.bitmap.width;
      const y = Math.floor(pixelIndex / image.bitmap.width);
      const idx = image.getPixelIndex(x, y);
      let [r, g, b, a] = [
        image.bitmap.data[idx],
        image.bitmap.data[idx + 1],
        image.bitmap.data[idx + 2],
        image.bitmap.data[idx + 3]
      ];
      r = (r & 0b11111100) | parseInt(chunk.slice(0, 2), 2);
      g = (g & 0b11111100) | parseInt(chunk.slice(2, 4), 2);
      b = (b & 0b11111100) | parseInt(chunk.slice(4, 6), 2);
      image.bitmap.data[idx] = r;
      image.bitmap.data[idx + 1] = g;
      image.bitmap.data[idx + 2] = b;
      image.bitmap.data[idx + 3] = a;
      pixelIndex++;
    }
  }

  const key = `${ranHex}G${avg.toString(16)}H${message.length.toString(16)}`;
  const outputPath = 'outputs/stego_image.png';
  await image.writeAsync(outputPath);

  return { key, outputPath };
};

// Express route to upload image and embed message
app.post('/embed', upload.single('image'), async (req, res) => {
  const message = req.body.message;
  const filePath = req.file.path;
  if (!message || !filePath) return res.status(400).send('Missing data');

  try {
    const { key, outputPath } = await embedData(filePath, message);
    res.json({ key, output: outputPath });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error embedding message');
  }
});

app.get("/", (req, res) => {
    res.send("Working!!");
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
