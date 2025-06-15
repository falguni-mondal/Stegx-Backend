const Jimp = require("jimp");

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

module.exports = embedMessageInImage;