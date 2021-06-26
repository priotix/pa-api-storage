const request = require('request-promise');
const config = require('config');
const AuthFailedError = require('../libs/errors/services/auth-service-failure-error');
const MultiValidationError = require('../libs/errors/validation/multi-validate-error');
const TokenExpiredError = require('../libs/errors/token-expired-error');

const service = {};

function authErrorHandler(reason) {
  const { message, errors } = reason.response.body;

  if (errors[0] && errors[0].slug === 'token-is-expired') {
    throw new TokenExpiredError('Token is expired', 'token');
  }

  if (reason.statusCode === 409) {
    throw new MultiValidationError(message, errors);
  }

  if (reason.statusCode === 401) {
    throw new AuthFailedError(message, reason.statusCode);
  }

  throw new AuthFailedError('Error on auth server', reason.statusCode);
}

service.validateToken = async function validateToken(token, audience) {
  console.log('Validating access token');
  if (audience === 'key') {
    const key = config.get('authorizationKey');
    if (config.get('authorizationKey') !== token) {
      throw new AuthFailedError('Authorization failed', 401);
    }

    return { userId: key };
  }

  const options = {
    url: `${config.get('auth2Server.host')}/oauth/authenticate`,
    json: true,
    headers: {
      Authorization: token,
    },
    qs: {
      audience,
    },
    method: 'GET',
  };

  return request(options).catch((reason) => {
    console.log('Token validation failed.');
    authErrorHandler(reason);
  });
};

module.exports = service;
