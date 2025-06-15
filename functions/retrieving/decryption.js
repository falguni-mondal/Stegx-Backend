const twosComplement = require("../../utils/twosComplement");

const decryption = (bits, ran, avg, len) => {
  const twosComp = twosComplement(ran);
  const decTwosComp = parseInt(twosComp, 2);

  let message = "";
  for (let i = 0; i < len; i++) {
    const binaryChunk = bits.slice(i * 24, (i + 1) * 24);
    const value = decTwosComp - parseInt(binaryChunk, 2);
    const ascii = Math.round(value / avg);
    message += String.fromCharCode(ascii);
  }
  return message;
};

module.exports = decryption