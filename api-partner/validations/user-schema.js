const Joi = require('joi');

const schemes = {};

schemes.createUser = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    name: Joi.string(),
  }),
};

module.exports = schemes;
