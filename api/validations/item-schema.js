const Joi = require('joi');
const config = require('config');

const schemes = {};

schemes.listItems = {
  params: Joi.object().keys({
    limit: Joi.number(),
    skip: Joi.number(),
    sort: Joi.string(),
    parant: Joi.string(),
    type: Joi.string().valid(config.get('itemTypesList')),
  }),
};

module.exports = schemes;
