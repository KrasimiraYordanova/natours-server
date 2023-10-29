const { getUserId } = require("../services/userService");
const AppError = require("../util/appError");
const { catchAsync } = require("./catchAsync");

function hasUser() {
  return catchAsync(async (req, res, next) => {
    const user = await getUserId(req.user._id);
    if (!user) {
      return next(new AppError("User for this token does not exist. You need to log in", 401));
    }
    req.user.role = user.role;
    req.user.name = user.fullName;
    next();
  });
}

function isRestricted(...roles) {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Permission forbidden", 403));
    }
    next();
  });
}

function isGuest() {
  return catchAsync(async (req, res, next) => {
    if (req.user) {
      return next(new AppError("You are already logged in", 400));
    } else {
      next();
    }
  });
}

exports.protectionGuardSession = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it is there
  // extracting the token out of the headers
  const token = req.headers["x-authorization"];
  // 2. Verify token - if there is no token throw error
  if (!token) {
    return next(new AppError("Please log in", 401));
  }
  // 3. if there is token we verify it and extract the user cridentails and his token
  const payload = verifyToken(token);
  req.user = payload;
  req.token = token;

  // 4. Check if user still exists
  const user = await getUserId(req.user._id);
  console.log(user);
  if (!user) {
    return next(new AppError("User for this token does not exist", 401));
  }
  // 5. Check if user has changed password after the JWT was - DEPENDS ON THE LOGIC IMPLEMENTATION
  next();
});

module.exports = {
  hasUser,
  isGuest,
  isRestricted,
};
