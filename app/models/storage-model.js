const bluebird = require('bluebird');
const config = require('config');
const lodash = require('lodash');
const mongoose = require('mongoose');

const { ObjectID } = require('mongodb');
const NotFoundError = require('../../libs/errors/not-found-error');

const storageSelectTresholdMultiplier = config.get('storageSelectTresholdMultipiler');

const Mongoose = bluebird.promisifyAll(mongoose);

const StorageSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  freeSpace: {
    type: Number,
  },
  status: {
    type: String,
    enum: config.get('storageStatusList'),
    default: config.get('storageStatus.inactive'),
  },
}, { timestamps: true });

// never include sensitive information in JSON output
StorageSchema.set('toJSON', {
  transform: (doc, ret) => {
    const {
      _id,
      __v,
      ...trans
    } = ret;

    return { id: doc.get('_id'), ...trans };
  },
});

// package storage model
let StorageModel;

StorageSchema.statics.createStorage = async function createStorage(data) {
  const item = new StorageModel(data);
  await item.save();

  return item;
};

StorageSchema.statics.deleteStorage = async function deleteStorge(storageId) {
  const item = await StorageModel.findOne({ _id: ObjectID(storageId) });
  if (!item) {
    throw new NotFoundError('Storage not found', 'storage');
  }

  return StorageModel.deleteOne({ _id: ObjectID(storageId) });
};

StorageSchema.statics.updateStorage = async function updateStorage(storageId, data) {
  const storage = await StorageModel.findOne({ _id: ObjectID(storageId) });
  if (storage) {
    throw new NotFoundError('Storage not found', 'storage');
  }

  await storage.updateData(data);

  return storage;
};

StorageSchema.statics.getFittingStorage = async function getFittingStorage(fileSize) {
  const storage = await StorageModel.findOne(
    { freeSpace: { $gt: fileSize * storageSelectTresholdMultiplier } },
    null,
    { sort: { freeSpace: 1 } },
  );

  if (!storage) {
    throw new NotFoundError('Storage not found', 'storage');
  }

  return storage;
};

StorageSchema.methods.updateData = async function updateData(data) {
  lodash.extend(this, data);

  return this.save();
};

StorageModel = Mongoose.model('Storage', StorageSchema);

module.exports = {
  StorageSchema,
  StorageModel,
};
