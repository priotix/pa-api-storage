const bluebird = require('bluebird');
const config = require('config');
const lodash = require('lodash');
const path = require('path');
const mongoose = require('mongoose');

const { ObjectID } = require('mongodb');
const NotFoundError = require('../../libs/errors/not-found-error');

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
  parentIds: [{
    type: Mongoose.Schema.Types.ObjectId,
  }],
  size: {
    type: Number,
  },
  status: {
    type: String,
    enum: config.get('itemStatesList'),
    default: config.get('itemStates.pending'),
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

ItemSchema.statics.getItemParents = async function getItemParents(parnet) {
  const item = ItemModel.findOne({ _id: ObjectID(parnet) });
  if (!item) {
    throw NotFoundError('Parent not found', 'item-parent');
  }

  item.parentIds.unshift(ObjectID(parnet));
  return item.parentIds;
};

ItemSchema.statics.listItems = async function listItems(payload) {
  const {
    filter,
    sort,
    skip = 0,
    limit = 20,
  } = payload;

  const { parent, owner, ...findQuery } = filter;
  if (parent) {
    findQuery['parentIds.0'] = ObjectID(parent);
  }

  if (owner) {
    findQuery.owner = ObjectID(owner);
  }

  const resp = await bluebird.all([
    ItemModel.find(findQuery).sort(sort).skip(skip).limit(limit),
    ItemModel.find(findQuery).countDocuments(),
  ]);

  return {
    documents: resp[0],
    total: resp[1],
  };
};

ItemSchema.statics.deleteItem = async function deleteItem(itemId) {
  const item = ItemModel.findOne({ _id: ObjectID(itemId) });
  if (!item) {
    throw NotFoundError('Item not found', 'item');
  }

  if (item.type === config.get('itemTypes.dir')) {
    await ItemModel.deleteMany({
      $or: [
        { _id: ObjectID(itemId) },
        { parentIds: ObjectID(itemId) },
      ],
    });
  } else {
    await ItemModel.deleteOne({ _id: ObjectID(itemId) });
  }
};

ItemSchema.statics.updateItem = async function updateItem(itemId, itemData) {
  const item = ItemModel.findOne({ _id: ObjectID(itemId) });
  if (item) {
    throw NotFoundError('Item not found', 'item');
  }

  await item.updateData(itemData);
  return item;
};

ItemSchema.methods.updateData = async function updateData(itemData) {
  lodash.extend(this, itemData);

  await this.save();
};

ItemSchema.methods.generatePath = function generatePath() {
  let itemPath = '';
  if (this.parentIds) {
    this.parentIds.reduceRight((_, parent) => {
      itemPath = path.join(itemPath, String(parent));
    }, null);
  }

  itemPath = String(this._id);

  return itemPath;
};

ItemModel = Mongoose.model('Item', ItemSchema);

module.exports = {
  ItemSchema,
  ItemModel,
};
