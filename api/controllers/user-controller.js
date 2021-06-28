const fs = require('fs');
const config = require('config');
const aqp = require('api-query-params');

const Identity = require('../../libs/auth/identity');

const { UserModel } = require('../../app/models/user-model');

class UserController {
  static async getUserInfo(ctx) {
    const owner = Identity.getUserId(ctx);

    const userInfo = await UserModel.getUserFreeSpace(owner);

    ctx.status = 200;
    ctx.body = userInfo;
  }
}

module.exports = UserController;
