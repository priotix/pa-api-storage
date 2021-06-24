const JWTDecoder = require('../jwt-decoder');

const identity = {};

identity.getAccessToken = function getAccessToken(ctx) {
  const { authorization } = ctx.request.headers;
  if (authorization.startsWith('Bearer ')) {
    // Remove Bearer from string
    return authorization.slice(7, authorization.length);
  }

  return null;
};

identity.getUserId = function getUserId(ctx) {
  return JWTDecoder.getUserId(identity.getAccessToken(ctx));
};

module.exports = identity;
