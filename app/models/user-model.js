const bluebird = require('bluebird');
const mongoose = require('mongoose');

const { ObjectID } = require('mongodb');
const NotFoundError = require('../../libs/errors/not-found-error');

const Mongoose = bluebird.promisifyAll(mongoose);

const UserSchema = new Mongoose.Schema({
  usedStorageSize: {
    type: Number,
    default: 0,
  },
  userTypeId: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'user-types',
  },
}, { timestamps: true });

// never include sensitive information in JSON output
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    const {
      _id,
      __v,
      ...trans
    } = ret;

    return { id: doc.get('_id'), ...trans };
  },
});

// package user model
let UserModel;

UserSchema.statics.createUser = async function createUser(itemData) {
  const item = new UserModel(itemData);
  await item.save();

  return item;
};

UserSchema.statics.updateUser = async function updateUser(userId, userData) {
  const user = UserModel.findOne({ _id: ObjectID(userId) });
  if (user) {
    throw NotFoundError('User not found', 'user');
  }

  await UserModel.updateOne({ _id: ObjectID(userId) }, { $set: userData });
  return user;
};

UserModel = Mongoose.model('User', UserSchema);

module.exports = {
  UserSchema,
  UserModel,
};
