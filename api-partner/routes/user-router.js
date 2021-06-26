const Router = require('koa-router');

const userCtrl = require('../controllers/user-controller');
const userSchema = require('../validations/user-schema');

const validate = require('../../libs/validate');
const setupAuthorization = require('../../libs/auth');

const authorize = setupAuthorization('key');

const userRouter = new Router();

userRouter.post(
  '/api/users',
  authorize,
  validate(userSchema.createUser),
  userCtrl.createUser,
);

module.exports = userRouter;
