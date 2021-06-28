const fs = require('fs');
const config = require('config');
const aqp = require('api-query-params');

const Identity = require('../../libs/auth/identity');
const StorageManager = require('../../libs/storage-manager');

const { ItemModel } = require('../../app/models/item-model');

const PayloadToLarge = require('../../libs/errors/payload-too-large');
const BadRequest = require('../../libs/errors/bad-request-error');
const { UserModel } = require('../../app/models/user-model');

const defaultFileSize = config.get('defaultFileSize');
class ItemController {
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
    const { name, parent, size = defaultFileSize } = ctx.query;

    const owner = Identity.getUserId(ctx);

    if (!(await StorageManager.IsValidFileSize(owner, size))) {
      throw new PayloadToLarge(size);
    }

    const itemData = { name };

    itemData.owner = owner;
    itemData.type = config.get('itemType.file');
    if (parent) {
      itemData.parents = await ItemModel.getItemParents(parent);
    }

    const item = await ItemModel.createItem(itemData);
    const fileMeta = await StorageManager.saveStream(item.generatePath(), ctx.filemeta.file, size);
    if (!fileMeta) {
      throw new BadRequest('File is larger then requested', 'storage');
    }

    await item.update({ ...fileMeta, status: config.get('itemStatus.active') });

    const fileSize = fileMeta.size;

    await UserModel.changeUsedStorage(owner, fileSize);

    ctx.status = 200;
    ctx.body = item;
  }

  static async deleteItem(ctx) {
    const { itemId } = ctx.params;
    const owner = Identity.getUserId(ctx);

    const item = await ItemModel.getItem({ id: itemId, owner });
    if (item.type === config.get('itemType.file')) {
      fs.unlinkSync(item.path);
    } else {
      fs.rmdirSync(item.path, { recursive: true });
    }
    await item.delete();
    await UserModel.changeUsedStorage(owner, -item.size);

    ctx.status = 200;
  }

  static async updateItem(ctx) {
    const { itemId } = ctx.params;
    const { name } = ctx.request.body;
    const owner = Identity.getUserId(ctx);

    const item = await ItemModel.updateItem({ itemId, owner }, { name });

    ctx.status = 200;
    ctx.body = item;
  }

  static async createItem(ctx) {
    const { name, parent } = ctx.request.body;
    const itemData = { name };

    if (parent) {
      itemData.parents = await ItemModel.getItemParents(parent);
    }
    const item = await ItemModel.createItem(itemData);

    ctx.status = 200;
    ctx.body = item;
  }
}

module.exports = ItemController;
