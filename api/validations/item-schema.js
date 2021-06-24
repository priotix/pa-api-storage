const Joi = require('joi');
const config = require('config');

const schemes = {};

schemes.listItems = {
  params: Joi.object().keys({
    path: Joi.string(),
    type: Joi.string().valid(config.get('itemTypesList')).required(),
  }),
};

module.exports = schemes;
