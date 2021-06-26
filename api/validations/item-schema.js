const Joi = require('joi');
const config = require('config');

const schemes = {};

schemes.listItems = {
  params: Joi.object().keys({
    limit: Joi.number(),
    skip: Joi.number(),
    sort: Joi.string(),
    parant: Joi.string(),
    type: Joi.string().valid(config.get('itemTypeList')),
  }),
};

schemes.createItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

schemes.updateItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

schemes.uploadItem = {
  params: Joi.object().keys({
    name: Joi.string().required(),
    size: Joi.number().required(),
    parant: Joi.string(),
  }),
};

module.exports = schemes;
