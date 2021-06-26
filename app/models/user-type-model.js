const bluebird = require('bluebird');
const mongoose = require('mongoose');

const Mongoose = bluebird.promisifyAll(mongoose);

const UserTypeSchema = new Mongoose.Schema({
  size: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
}, { timestamps: true });

// never include sensitive information in JSON output
UserTypeSchema.set('toJSON', {
  transform: (doc, ret) => {
    const {
      _id,
      __v,
      ...trans
    } = ret;

    return { id: doc.get('_id'), ...trans };
  },
});

// package user type model
const UserTypeModel = Mongoose.model('UserType', UserTypeSchema);

module.exports = {
  UserTypeSchema,
  UserTypeModel,
};
