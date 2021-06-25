const config = require('config');
const aqp = require('api-query-params');

const Identity = require('../../libs/auth/identity');
const StorageManager = require('../../libs/storage-manager');

const { ItemModel } = require('../../app/models/item-model');

const PayloadToLarge = require('../../libs/errors/payload-too-large');
const BadRequest = require('../../libs/errors/bad-request-error');

const defaultFileSize = config.get('defaultFileSize');
class ItemsController {
  static async listItems(ctx) {
    const {
      skip,
      limit,
      sort,
      filter,
    } = aqp(ctx.query);

    filter.owner = Identity.getUserId(ctx);

    const items = await ItemModel.listItems({
      skip,
      limit,
      sort,
      filter,
    });

    ctx.status = 200;
    ctx.body = items;
  }

  static async uploadItem(ctx) {
    const { name, parent, size = defaultFileSize } = ctx.params;

    const owner = Identity.getUserId(ctx);

    if (!StorageManager.IsValidFileSize(owner, size)) {
      throw PayloadToLarge(size);
    }

    const itemData = { name };

    itemData.owner = owner;
    itemData.type = config.get('itemTypes.file');
    if (parent) {
      itemData.parents = await ItemModel.getItemParents(parent);
    }

    const item = await ItemModel.createItem(itemData);
    const fileMeta = StorageManager.saveStream(item.generatePath(), ctx.filemeta.file, size);
    if (!fileMeta) {
      throw BadRequest('File is larger then requested', 'storage');
    }

    await item.updateData(fileMeta);

    ctx.status = 200;
    ctx.body = item;
  }

  static async deleteItem(ctx) {
    const { itemId } = ctx.params;

    // fs delete item
    await ItemModel.deleteItem(itemId);

    ctx.status = 200;
  }

  static async updateItem(ctx) {
    const { itemId } = ctx.params;
    const { name } = ctx.request.body;

    const item = await ItemModel.updateItem(itemId, { name });

    ctx.status = 200;
    ctx.body = item;
  }

  static async createItem(ctx) {
    const { name } = ctx.request.body;

    const item = await ItemModel.createItem(itemId, { name });

    ctx.status = 200;
    ctx.body = item;
  }
}

module.exports = ItemsController;
