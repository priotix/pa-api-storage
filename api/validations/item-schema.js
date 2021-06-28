const Joi = require('joi');
const config = require('config');

const schemes = {};

schemes.listItems = {
  query: Joi.object().keys({
    limit: Joi.number(),
    skip: Joi.number(),
    sort: Joi.string(),
    parent: Joi.string(),
    type: Joi.string().valid(config.get('itemTypeList')),
  }),
};

schemes.searchItems = {
  query: Joi.object().keys({
    limit: Joi.number(),
    skip: Joi.number(),
    sort: Joi.string(),
    query: Joi.string(),
    type: Joi.string().valid(config.get('itemTypeList')),
  }),
};

schemes.createItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    parent: Joi.string(),
  }),
};

schemes.updateItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

schemes.uploadItem = {
  query: Joi.object().keys({
    name: Joi.string().required(),
    size: Joi.number(),
    parent: Joi.string(),
  }),
};

module.exports = schemes;
