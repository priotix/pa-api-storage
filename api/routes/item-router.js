const Router = require('koa-router');

const itemCtrl = require('../controllers/item-controller');
const itemSchema = require('../validations/item-schema');

const validate = require('../../libs/validate');
const setupAuthorization = require('../../libs/auth');

const authorize = setupAuthorization('general');

const itemRouter = new Router();

itemRouter.get(
  '/items',
  authorize,
  validate(itemSchema.listItems),
  itemCtrl.listItems,
);

module.exports = itemRouter;
