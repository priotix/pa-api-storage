const aqp = require('api-query-params');
const { ItemModel } = require('../../app/models/item-model');

class ItemsController {
  static async lsitItems(ctx) {
    const {
      skip,
      limit,
      sort,
      filter,
    } = aqp(ctx.query);

    const news = await ItemModel.lsitItems({
      skip,
      limit,
      sort,
      filter,
    });

    ctx.status = 200;
    ctx.body = news;
  }
}

module.exports = ItemsController;
