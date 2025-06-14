const twosComplement = (binaryString) => {
  if (binaryString.length !== 24) {
    return "Binary string must be 24 bits long";
  }

  // 1. Invert the bits (1's complement)
  let invertedString = "";
  for (let bit of binaryString) {
    invertedString += bit === "0" ? "1" : "0";
  }

  // 2. Add 1 to the 1's complement
  let carry = 1;
  let result = "";
  for (let i = invertedString.length - 1; i >= 0; i--) {
    let sum = parseInt(invertedString[i]) + carry;
    result = (sum % 2).toString() + result;
    carry = Math.floor(sum / 2);
  }

  return result;
};

module.exports = twosComplement;