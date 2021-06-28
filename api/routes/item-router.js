const Router = require('koa-router');

const itemCtrl = require('../controllers/item-controller');
const itemSchema = require('../validations/item-schema');

const validate = require('../../libs/validate');
const setupAuthorization = require('../../libs/auth');
const { single: singleMultipartStream } = require('../../libs/multipart-stream');

const authorize = setupAuthorization('general');

const itemRouter = new Router();

itemRouter.get(
  '/items',
  authorize,
  validate(itemSchema.listItems),
  itemCtrl.listItems,
);

itemRouter.get(
  '/items/search',
  authorize,
  validate(itemSchema.searchItems),
  itemCtrl.searchItems,
);

itemRouter.post(
  '/items',
  authorize,
  validate(itemSchema.createItem),
  itemCtrl.createItem,
);

itemRouter.put(
  '/items/:itemId',
  authorize,
  validate(itemSchema.updateItem),
  itemCtrl.updateItem,
);

itemRouter.delete(
  '/items/:itemId',
  authorize,
  itemCtrl.deleteItem,
);

itemRouter.post(
  '/items/upload',
  authorize,
  validate(itemSchema.uploadItem),
  singleMultipartStream,
  itemCtrl.uploadItem,
);

module.exports = itemRouter;
