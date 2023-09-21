const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../util/appError");

const tokenBlacklist = new Set();

async function register(userObj) {
  // on register - looking to find inside the database if the user exists
  const existingUser = await User.findOne({ email: userObj.email }).collation({
    locale: "en",
    strength: 2,
  });
  // if user exists - throw error telling the user that the email is already taken
  if (existingUser) {
    return new AppError("User already exists", 400);
  }
  // if user does not exists
  // - hashing his password
  const hashingPass = await bcrypt.hash(userObj.password, 10);
  // - saving his data to the database, returning user data to create a token
  const user = await User.create({
    fullName: userObj.name,
    email: userObj.email,
    hashedPass: hashingPass,
  });
  // - creating user token from the saved data
  return createToken(user);
}

async function login(email, password) {
  // on login - looking to find inside the database the user's cridentials
  const user = await User.findOne({ email }).collation({
    locale: "en",
    strength: 2,
  });
  // if user's credentials are wrong(email)' - throw error telling the user that email or pass are wrong
//   if (!user) {
//     // throw new Error("Email or password are incorrect");
//     return new AppError("Email or password are incorrect", 400);
//   }
  // comparing the user entered password with the hashedPass inside the database to see if they match
//   const hashMached = await bcrypt.compare(password, user.hashedPass);
  // if password does not match with the hashedPass - throwing error
//   if (!user || hashMached == false) {
  if (!user || (await bcrypt.compare(password, user.hashedPass))) {
    // throw new Error("Email or password are incorrect");
    return new AppError("Email or password are incorrect", 400);
  }
  // if match - return token
  return createToken(user);
}

function logout(token) {
  tokenBlacklist.add(token);
}

function createToken(user) {
  // inside the payload we enter the id and email of the user
  const payload = {
    _id: user._id,
    email: user.email,
  };
  // returning a token with the payload info + secret words + user info
  return {
    _id: user._id,
    name: user.fullName,
    email: user.email,
    accessToken: jwt.sign(payload, process.env.JWT_SECRET),
  };
}

function verifyToken(token) {
  // scan blacklist for token
  if (tokenBlacklist.has(token)) {
    throw new Error("Token is blacklisted");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  register,
  login,
  logout,
  verifyToken,
};
