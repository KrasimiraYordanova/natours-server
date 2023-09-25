const User = require("../models/User");
const bcrypt = require("bcrypt");

// get all users
async function getAllUsers() {
  return User.find();
}

// get user by Id
async function getUserId(id) {
  return User.findOne({ _id: id });
}

// get user by email
async function getUserEmail(email) {
  return User.findOne({ email: email });
}

// update my data
async function updateData(id, user) {
  return User.findByIdAndUpdate(id, user, { new: true, runValidators: true });
}

// close my account
async function deactivateAccount(id) {
  return User.findByIdAndUpdate(id, { active: false });
}

// edit user
async function updateUser(id, user) {
  const existing = await User.findById(id);
  const hashMached = await bcrypt.compare(user.password, existing.hashedPass);
  if (hashMached == false) {
    existing.hashedPass = await bcrypt.hash(user.password, 10);
  }
  existing.fullName = user.name;
  existing.email = user.email;
  existing.photo = user.image;

  return existing.save();
}

// delete user
async function deleteUserId(id) {
  return User.findByIdAndDelete(id);
}

module.exports = {
  getAllUsers,
  getUserId,
  getUserEmail,
  updateUser,
  deleteUserId,
  updateData,
  deactivateAccount,
};
