const authService = require('../../services/auth-service');
const AuthorizationError = require('../errors/auth/authorization-error');

function setupAuthorization(audience) {
  return async (ctx, next) => {
    if (!ctx.headers.authorization) {
      console.log('Authorization header not found');

      throw new AuthorizationError();
    }

    ctx.state.identity = await authService.validateToken(ctx.headers.authorization, audience);
    return next();
  };
}

module.exports = setupAuthorization;
