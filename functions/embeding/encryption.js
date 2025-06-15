const keyGenerator = require("../../utils/keyGenerator");
const twosComplement = require("../../utils/twosComplement");

const encryption = (text) => {
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

  const key = keyGenerator(ran, avg, text.length);
  return ({binaryDataArr : subtracted, key});
};

module.exports = encryption;