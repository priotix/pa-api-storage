const config = require('config');
const aqp = require('api-query-params');

const Identity = require('../../libs/auth/identity');
const StorageManager = require('../../libs/storage-manager');

const { ItemModel } = require('../../app/models/item-model');

const PayloadToLarge = require('../../libs/errors/payload-too-large');
const BadRequest = require('../../libs/errors/bad-request-error');
const { UserModel } = require('../../app/models/user-model');
const { StorageModel } = require('../../app/models/storage-model');

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

  static async searchItems(ctx) {
    const {
      skip,
      limit,
      sort,
      filter,
    } = aqp(ctx.query);

    filter.owner = Identity.getUserId(ctx);

    const items = await ItemModel.searchItems({
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
      const parentData = await ItemModel.getItem({ itemId: parent, owner });
      if (parentData.type !== config.get('itemType.dir')) {
        throw new BadRequest('Invalide parent', 'item-parent');
      }
      itemData.parentIds = await ItemModel.getItemParents(parent);
    }
    const item = await ItemModel.createItem(itemData);

    let fileMeta;
    try {
      fileMeta = await StorageManager.saveStream(item.generatePath(), ctx.filemeta.file, size);
    } catch (err) {
      throw new BadRequest('Unable to store contect', 'stream');
    }

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

    const item = await ItemModel.getItem({ itemId, owner });
    if (item.type === config.get('itemType.file')) {
      await StorageManager.removeFile(item.path);
      await item.delete();
      await UserModel.changeUsedStorage(owner, -item.size);
      await StorageModel.changeUsedStorages([{ id: item.storageId, size: -item.size }]);
    } else {
      const storagesUsedSpaces = await item.getStoragesUsedSpaces();
      await StorageModel.changeUsedStorages(storagesUsedSpaces);
      const userUsedSpace = Object.values(storagesUsedSpaces).reduce((acc, space) => {
        acc += space;
        return acc;
      }, 0);
      await UserModel.changeUsedStorage(owner, -userUsedSpace);
      await item.deleteRecursive();
    }

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

    const owner = Identity.getUserId(ctx);
    itemData.owner = owner;
    itemData.type = config.get('itemType.dir');
    itemData.status = config.get('itemStatus.active');
    if (parent) {
      const parentData = await ItemModel.getItem({ itemId: parent, owner });
      if (parentData.type !== config.get('itemType.dir')) {
        throw new BadRequest('Invalide parent', 'item-parent');
      }
      itemData.parentIds = await ItemModel.getItemParents(parent);
    }

    const item = await ItemModel.createItem(itemData);

    ctx.status = 200;
    ctx.body = item;
  }
}

module.exports = ItemController;
