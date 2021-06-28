const BadRequestError = require('../libs/errors/bad-request-error');
const LocalAdapter = require('./local-adapter');

class StorageAdapterFactory {
  static getStorageAdapter(type) {
    let storageAdapter;

    switch (type) {
      case 'local':
        storageAdapter = LocalAdapter;
        break;
      default:
        throw new BadRequestError(`Unsupported storage adapter type ${type}`, 'adapter-type');
    }

    return storageAdapter;
  }
}

module.exports = StorageAdapterFactory;
