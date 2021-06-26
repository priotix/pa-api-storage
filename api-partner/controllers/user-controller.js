const { UserModel } = require('../../app/models/user-model');
const { UserTypeModel } = require('../../app/models/user-type-model');

class UserController {
  static async createUser(ctx) {
    const { name, userId } = ctx.request.body;
    const data = { _id: userId };

    if (name) {
      const userType = await UserTypeModel.getUserType({ name });
      data.userTypeId = userType.id;
    }
    const user = await UserModel.createUser(data);

    ctx.status = 200;
    ctx.body = user;
  }
}

module.exports = UserController;
