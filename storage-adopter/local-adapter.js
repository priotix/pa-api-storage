const fs = require('fs');

class LocalAdapter {
  static async removeFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  }

  static async removeFileSync(filePath) {
    return fs.unlinkSync(filePath);
  }

  static async removeFolder(folderPath) {
    return new Promise((resolve, reject) => {
      fs.rmdir(folderPath, { recursive: true }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  }

  static async createWriteStream(filePath) {
    const dirPath = filePath.slice(0, filePath.lastIndexOf('/'));
    if (!fs.existsSync(dirPath)) {
      await new Promise((resolve, reject) => {
        fs.mkdir(dirPath, { recursive: true }, (err, data) => {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        });
      });
    }

    return fs.createWriteStream(filePath);
  }
}

module.exports = LocalAdapter;
