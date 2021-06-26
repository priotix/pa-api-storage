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
    enum: config.get('itemStatusList'),
    default: config.get('itemStatus.pending'),
  },
  type: {
    type: String,
    enum: config.get('itemTypeList'),
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

// package item model
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
  findQuery.status = config.get('itemStatus.active');
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

ItemSchema.statics.searchItems = async function searchItems(payload) {
  const {
    filter,
    sort,
    skip = 0,
    limit = 20,
  } = payload;

  const { owner, query, ...findQuery } = filter;
  findQuery.status = config.get('itemStatus.active');
  findQuery.owner = ObjectID(owner);
  if (query) {
    findQuery.$text = { $search: query };
  }

  const resp = await bluebird.all([
    ItemModel.find(findQuery).sort(sort).skip(skip).limit(limit),
    ItemModel.find(findQuery).countDocuments(),
  ]);

  return {
    documents: resp[0].map(async (doc) => {
      let itemPath = '';
      if (doc.parentIds) {
        const parents = await ItemModel.find({ _id: doc.parentIds });
        itemPath = path.join(parents.reduceRight((acc, parent) => {
          acc = path.join(acc, String(parent.name));
          return acc;
        }, ''));
      }

      doc.path = path.join(itemPath, doc.name);
      return doc;
    }),
    total: resp[1],
  };
};

ItemSchema.statics.deleteItem = async function deleteItem({ itemId, owner }) {
  const item = ItemModel.findOne({ _id: ObjectID(itemId), owner: ObjectID(owner) });
  if (!item) {
    throw NotFoundError('Item not found', 'item');
  }

  if (item.type === config.get('itemType.dir')) {
    await ItemModel.updateMany({
      $or: [
        { _id: ObjectID(itemId), owner: ObjectID(owner) },
        { parentIds: ObjectID(itemId), owner: ObjectID(owner) },
      ],
    }, { $set: { status: config.get('itemStatus.deleted') } });
  } else {
    await ItemModel.updateOne(
      { _id: ObjectID(itemId), owner: ObjectID(owner) },
      { $set: { status: config.get('itemStatus.deleted') } },
    );
  }
};

ItemSchema.statics.updateItem = async function updateItem({ itemId, owner }, itemData) {
  const item = ItemModel.findOne({ _id: ObjectID(itemId), owner: ObjectID(owner) });
  if (item) {
    throw NotFoundError('Item not found', 'item');
  }

  await item.update(itemData);
  return item;
};

ItemSchema.statics.getItem = async function getItem({ itemId, owner }) {
  const item = ItemModel.findOne({ _id: ObjectID(itemId), owner: ObjectID(owner) });
  if (item) {
    throw NotFoundError('Item not found', 'item');
  }

  return item;
};

ItemSchema.methods.update = async function update(itemData) {
  lodash.extend(this, itemData);

  await this.save();
};

ItemSchema.methods.delete = async function deleteData() {
  this.status = config.get('itemStatus.delete');

  await this.save();
};

ItemSchema.methods.generatePath = function generatePath() {
  let itemPath = `${String(this.owner)}`;
  if (this.parentIds) {
    itemPath = this.parentIds.reduceRight((acc, parent) => {
      acc = path.join(acc, String(parent));
      return acc;
    }, itemPath);
  }

  itemPath = path.join(itemPath, String(this._id));

  return itemPath;
};

ItemModel = Mongoose.model('Item', ItemSchema);

module.exports = {
  ItemSchema,
  ItemModel,
};
