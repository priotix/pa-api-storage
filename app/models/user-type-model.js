const bluebird = require('bluebird');
const mongoose = require('mongoose');

const Mongoose = bluebird.promisifyAll(mongoose);

const NotFoundError = require('../../libs/errors/not-found-error');

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
let UserTypeModel;

UserTypeSchema.statics.getUserType = async function getUserType(filter) {
  const userType = await UserTypeModel.findOne(filter);
  if (!userType) {
    throw new NotFoundError('User type not found', 'user-type');
  }

  return userType;
};

UserTypeModel = Mongoose.model('UserType', UserTypeSchema);

module.exports = {
  UserTypeSchema,
  UserTypeModel,
};
