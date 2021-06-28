const Router = require('koa-router');

const userCtrl = require('../controllers/user-controller');

const setupAuthorization = require('../../libs/auth');

const authorize = setupAuthorization('general');

const userRouter = new Router();

userRouter.get(
  '/users/info',
  authorize,
  userCtrl.usersInfo,
);

module.exports = userRouter;
