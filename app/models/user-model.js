const bluebird = require('bluebird');
const mongoose = require('mongoose');
const config = require('config');

const { ObjectID } = require('mongodb');
const NotFoundError = require('../../libs/errors/not-found-error');
const { UserTypeModel } = require('./user-type-model');

const Mongoose = bluebird.promisifyAll(mongoose);

const UserSchema = new Mongoose.Schema({
  usedStorageSize: {
    type: Number,
    default: 0,
  },
  userTypeId: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: UserTypeModel,
    default: config.get('defaultUserType'),
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

UserSchema.statics.createUser = async function createUser(userData) {
  const user = new UserModel(userData);
  await user.save();

  return user;
};

UserSchema.statics.updateUser = async function updateUser(userId, userData) {
  const user = UserModel.findOne({ _id: ObjectID(userId) });
  if (!user) {
    throw new NotFoundError('User not found', 'user');
  }

  await UserModel.updateOne({ _id: ObjectID(userId) }, { $set: userData });
  return user;
};

UserSchema.statics.getUserFreeSpace = async function getUserFreeSpace(userId) {
  const user = await UserModel.findOne({ _id: ObjectID(userId) }).populate('userTypeId');
  if (!user) {
    throw new NotFoundError('User not found', 'user');
  }

  return { free: user.userTypeId.size - user.usedStorageSize, total: user.userTypeId.size };
};

UserSchema.statics.changeUsedStorage = async function changeUsedStorage(userId, storageDiff) {
  const user = await UserModel.findOne({ _id: ObjectID(userId) });
  if (!user) {
    throw new NotFoundError('User not found', 'user');
  }

  user.usedStorageSize += storageDiff;

  await user.save();

  return user;
};

UserModel = Mongoose.model('User', UserSchema);

module.exports = {
  UserSchema,
  UserModel,
};
