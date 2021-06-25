const fs = require('fs');
const path = require('path');
const config = require('config');
const StorageModel = require('../app/models/storage-model');

const storageMountPath = config.get('storageMountPath');
class StorageManager {
  static async saveStream(filePath, readStream, size) {
    const { id: storageId, path: storagePath } = await this.getFittingStorage(size);
    const fullPath = filePath.join(storagePath, filePath);
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
      if (isFileSizeCorrect) {
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
    const storage = StorageModel.getFittingStorage(fileSize);
    return {
      id: storage._id,
      path: path.join(storageMountPath, storage.path),
    };
  }
}

module.exports = StorageManager;
