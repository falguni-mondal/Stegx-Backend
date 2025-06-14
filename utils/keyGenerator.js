const keyGenerator = (rnd, avg, len) => {
  const keyParts = [
    parseInt(rnd, 2).toString(16),
    avg.toString(16),
    len.toString(16),
  ];

  let key = keyParts[0];

  for (let i = 1; i < keyParts.length; i++) {
    const seperator = String.fromCharCode(Math.floor(Math.random() * 20 + 71));
    key = key + seperator + keyParts[i];
  }
  return key;
};

module.exports = keyGenerator;