const AuthorizationError = require('../errors/auth/authorization-error');
const NotFoundError = require('../errors/not-found-error');
const { UserModel } = require('../../app/models/item-model');

async function authorizeIdentity(ctx, next) {
  const { identity } = ctx.state;
  const { user_id: userId } = ctx.params;

  if (!identity || !identity.email || !userId) {
    console.log('No identity or target user found');
    throw new AuthorizationError();
  }

  const user = await UserModel.getUserById(ctx.params.user_id);
  if (!user) {
    const err = new NotFoundError('User not found', 'user');
    throw err;
  }

  if (identity.email !== user.email) {
    console.log(`Not authorized to access data for user ${user.email}`);
    throw new AuthorizationError();
  }

  return next();
}

module.exports = authorizeIdentity;
