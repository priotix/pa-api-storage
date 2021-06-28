const fs = require('fs');

class LocalAdapter {
  static async removeFile(filePath) {
    return fs.unlink(filePath);
  }

  static async removeFileSync(filePath) {
    return fs.unlinkSync(filePath);
  }

  static async createWriteStream(filePath) {
    const dirPath = filePath.slice(0, filePath.lastIndexOf('/'));
    if (!fs.existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }

    return fs.createWriteStream(filePath);
  }
}

module.exports = LocalAdapter;
