const Joi = require('joi');

const schemes = {};

schemes.createUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = schemes;
