const fs = require('fs');
const path = require('path');
const config = require('config');
const { StorageModel } = require('../app/models/storage-model');
const { UserModel } = require('../app/models/user-model');

const storageMountPath = config.get('storageMountPath');
class StorageManager {
  static async saveStream(filePath, readStream, size) {
    const { id: storageId, path: storagePath } = await this.getFittingStoragePath(size);

    const fullPath = path.join(storagePath, filePath);
    const dirPath = fullPath.slice(0, fullPath.lastIndexOf('/'));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const fileWriteStream = fs.createWriteStream(fullPath);

    const stream = readStream.pipe(fileWriteStream);

    let fullSize = 0;
    let isFileSizeCorrect = true;

    readStream.on('data', (data) => {
      fullSize += data.length;
      if (fullSize > size) {
        isFileSizeCorrect = false;
        stream.close();
      }
    });

    fileWriteStream.on('close', () => {
      if (!isFileSizeCorrect) {
        fs.unlinkSync(fullPath);
      }
    });

    await new Promise((resolve) => stream.on('finish', resolve));

    if (isFileSizeCorrect) {
      return {
        path: fullPath,
        storageId,
        size: fullSize,
      };
    }

    return null;
  }

  static async getFittingStoragePath(fileSize) {
    // TODO handle exception
    const storage = await StorageModel.getFittingStorage(fileSize);

    return {
      id: storage.id,
      path: path.join(storageMountPath, storage.id),
    };
  }

  static async IsValidFileSize(userId, filesize) {
    const userFreeSpace = await UserModel.getUserFreeSpace(userId);
    if (filesize > userFreeSpace) {
      return false;
    }

    return true;
  }
}

module.exports = StorageManager;
