const config = require('config');
const aqp = require('api-query-params');

const Identity = require('../../libs/auth/identity');
const StorageManager = require('../../libs/storage-manager');

const { ItemModel } = require('../../app/models/item-model');

const PayloadToLarge = require('../../libs/errors/payload-too-large');
const BadRequestError = require('../../libs/errors/bad-request-error');
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
      const parentData = await ItemModel.getItem({ itemId: parent, owner });
      if (parentData.type !== config.get('itemType.dir')) {
        throw new BadRequestError('Invalide parent', 'item-parent');
      }
      itemData.parentIds = await ItemModel.getItemParents(parent);
    }
    const item = await ItemModel.createItem(itemData);

    let fileMeta;
    try {
      fileMeta = await StorageManager.saveStream(item.generatePath(), ctx.filemeta.file, size);
    } catch (err) {
      await item.delete();
      throw new BadRequestError('Unable to store contect', 'stream');
    }

    if (!fileMeta) {
      await item.delete();
      throw new BadRequestError('File is larger then requested', 'storage');
    }

    try {
      await item.update({ ...fileMeta, status: config.get('itemStatus.active') });
    } catch (err) {
      throw new BadRequestError('Invalide data', 'item-data');
    }

    const fileSize = fileMeta.size;

    await UserModel.changeUsedStorage(owner, fileSize);

    const freeStorageParam = {};
    freeStorageParam[item.storageId] = -item.size;
    await StorageManager.changeFreeStorages(freeStorageParam);

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

      const freeStorageParam = {};
      freeStorageParam[item.storageId] = item.size;
      await StorageManager.changeFreeStorages(freeStorageParam);
    } else {
      const storagesUsedSpaces = await item.getStoragesUsedSpaces();
      await StorageManager.changeFreeStorages(storagesUsedSpaces);

      const userUsedSpace = Object.values(storagesUsedSpaces).reduce((acc, space) => {
        acc += space;
        return acc;
      }, 0);

      const folderPath = await item.generatePath();
      await StorageManager.removeFolder(Object.keys(storagesUsedSpaces), folderPath);
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
        throw new BadRequestError('Invalide parent', 'item-parent');
      }
      itemData.parentIds = await ItemModel.getItemParents(parent);
    }

    const item = await ItemModel.createItem(itemData);

    ctx.status = 200;
    ctx.body = item;
  }

  static async getItemInfo(ctx) {
    const { itemId } = ctx.params;
    const owner = Identity.getUserId(ctx);

    const item = await ItemModel.getItemWithPath({ itemId, owner });

    ctx.status = 200;
    ctx.body = item;
  }

  static async getItem(ctx) {
    const { itemId } = ctx.params;
    const owner = Identity.getUserId(ctx);

    const item = await ItemModel.getItem({ itemId, owner, type: config.get('itemType.file') });

    const file = await StorageManager.getStream(item.path);

    ctx.response.set('Content-disposition', `attachment; filename=${item.name}`);
    ctx.response.set('Content-type', 'application/txt');
    ctx.status = 200;
    ctx.body = file;
  }
}

module.exports = ItemController;
