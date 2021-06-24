const bluebird = require('bluebird');
const config = require('config');
const lodash = require('lodash');
const mongoose = require('mongoose');

const Mongoose = bluebird.promisifyAll(mongoose);

const ItemSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: Mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: config.get('itemStatesList'),
    default: config.get('itemStates.pending'),
  },
  parentIds: [{
    type: Mongoose.Schema.Types.ObjectId,
  }],
  size: {
    type: Number,
  },
  type: {
    type: String,
    enum: config.get('itemTypesList'),
    required: true,
  },
  path: {
    type: String,
  },
  storageId: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'storages',
  },
}, { timestamps: true });

// never include sensitive information in JSON output
ItemSchema.set('toJSON', {
  transform: (doc, ret) => {
    const {
      _id,
      __v,
      ...trans
    } = ret;

    return { id: doc.get('_id'), ...trans };
  },
});

// package user model
let ItemModel;

ItemSchema.statics.createItem = async function createItem(itemData) {
  const item = new ItemModel(itemData);
  await item.save();

  return item;
};

ItemSchema.statics.getItems = async function getItems(filter, sort, skip = 0, limit = 20) {
  const resp = await bluebird.all([
    ItemModel.find(filter).sort(sort).skip(skip).limit(limit),
    ItemModel.find(filter).count(),
  ]);

  return {
    documents: resp[0],
    total: resp[1],
  };
};

ItemSchema.methods.updateData = async function updateData(itemData) {
  lodash.extend(this, itemData);

  await this.save();
};

ItemModel = Mongoose.model('Item', ItemSchema);

module.exports = {
  ItemSchema,
  ItemModel,
};
