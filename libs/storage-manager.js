const path = require('path');
const bluebird = require('bluebird');
const config = require('config');
const { StorageModel } = require('../app/models/storage-model');
const { UserModel } = require('../app/models/user-model');

const storageMountPath = config.get('storageMountPath');

const storageAdapter = require('../storage-adopter/storage-adapter-factorey').getStorageAdapter('local');

class StorageManager {
  static async saveStream(filePath, readStream, size) {
    const { id: storageId, path: storagePath } = await this.getFittingStoragePath(size);

    const fullPath = path.join(storagePath, filePath);

    const fileWriteStream = await storageAdapter.createWriteStream(fullPath);

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
        storageAdapter.removeFileSync(fullPath);
      }
    });

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    if (isFileSizeCorrect) {
      return {
        path: fullPath,
        storageId,
        size: fullSize,
      };
    }

    return null;
  }

  static async getStream(filePath) {
    const fileReadStream = await storageAdapter.createReadStream(filePath);
    return fileReadStream;
  }

  static async removeFile(filePath) {
    return storageAdapter.removeFile(filePath);
  }

  static async removeFolder(storageIds, folderPath) {
    const storages = await StorageModel.find({ _id: { $in: storageIds } });

    return bluebird.map(storages, async (storage) => {
      const fullPath = path.join(storageMountPath, storage.name, folderPath);

      await storageAdapter.removeFolder(fullPath);
    });
  }

  static async getFittingStoragePath(fileSize) {
    // TODO handle exception
    const storage = await StorageModel.getFittingStorage(fileSize);

    return {
      id: storage.id,
      path: path.join(storageMountPath, storage.name),
    };
  }

  static async IsValidFileSize(userId, filesize) {
    const userFreeSpace = await UserModel.getUserFreeSpace(userId);
    if (filesize > userFreeSpace) {
      return false;
    }

    return true;
  }

  static async changeFreeStorages(storagesUsedSpaces) {
    return StorageModel.changeFreeStorages(storagesUsedSpaces);
  }
}

module.exports = StorageManager;
