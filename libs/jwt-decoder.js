const AuthorizationError = require('./errors/auth/authorization-error');
const jwt = require('jsonwebtoken');

const jwtDecoder = {};

jwtDecoder.getUserEmail = (accessToken) => {
  const decoded = jwt.decode(accessToken, { complete: true });
  if (!decoded.payload.user.email) {
    throw new AuthorizationError('No email in payload', 'user');
  }
  return decoded.payload.user.email;
};

jwtDecoder.getUserId = (accessToken) => {
  const decoded = jwt.decode(accessToken, { complete: true });
  if (!decoded.payload.context || !decoded.payload.context.userId) {
    throw new AuthorizationError('No userId in payload', 'user');
  }
  return decoded.payload.context.userId;
};

module.exports = jwtDecoder;
