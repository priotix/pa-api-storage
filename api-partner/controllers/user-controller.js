const { UserModel } = require('../../app/models/user-model');

class UserController {
  static async createUser(ctx) {
    const item = await UserModel.createUser(ctx.request.body);

    ctx.status = 200;
    ctx.body = item;
  }
}

module.exports = UserController;
