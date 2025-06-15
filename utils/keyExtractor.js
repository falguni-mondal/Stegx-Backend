const keyExtractor = (key) => {
  const parts = key.split(/[G-Z]/i);
  if (parts.length !== 3) throw new Error("Invalid key format");

  const ran = parseInt(parts[0], 16).toString(2).padStart(24, "0");
  const avg = parseInt(parts[1], 16);
  const len = parseInt(parts[2], 16);
  return { ran, avg, len };
};

module.exports = keyExtractor;