const aqp = require('api-query-params');
const { ItemModel } = require('../../app/models/item-model');

class ItemsController {
  static async listItems(ctx) {
    const {
      skip,
      limit,
      sort,
      filter,
    } = aqp(ctx.query);

    const items = await ItemModel.listItems({
      skip,
      limit,
      sort,
      filter,
    });

    ctx.status = 200;
    ctx.body = items;
  }
}

module.exports = ItemsController;
