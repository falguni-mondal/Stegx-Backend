const Jimp = require('jimp');

const extractBinaryFromImage = async (imgPath, totalBitsNeeded) => {
  const image = await Jimp.read(imgPath);
  let bits = "";
  let pixelIndex = 0;

  const totalPixels = Math.ceil(totalBitsNeeded / 6);

  for (let i = 0; i < totalPixels; i++) {
    const x = pixelIndex % image.bitmap.width;
    const y = Math.floor(pixelIndex / image.bitmap.width);

    const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));

    bits += (r & 0b11).toString(2).padStart(2, "0");
    bits += (g & 0b11).toString(2).padStart(2, "0");
    bits += (b & 0b11).toString(2).padStart(2, "0");

    pixelIndex++;
  }

  return bits;
};

module.exports = extractBinaryFromImage;