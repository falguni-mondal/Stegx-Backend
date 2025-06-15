const fs = require("fs");
const path = require("path");

const deleteAllFiles = (folderPath) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      // Check if it's a file before deleting
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error checking file:", err);
          return;
        }

        if (stats.isFile()) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log(`Deleted: ${filePath}`);
            }
          });
        }
      });
    });
  });
};

module.exports = deleteAllFiles;