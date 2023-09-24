const {
  register,
  login,
  logout,
  getUserEmail,
  updateUser,
} = require("../services/authService");
const { body, validationResult } = require("express-validator");
const AppError = require("../util/appError");
const { catchAsync } = require("../middlewares/catchAsync");

const authController = require("express").Router();

authController.post(
  "/register",
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const userObj = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    };
    console.log(userObj);
    // catching the errros from express-validator
    const { errors } = validationResult(req);
    const errorsString = errors.map((obj) => obj.msg).join(", ");
    if (errors.length > 0) {
      return next(new AppError(errorsString, 400));
    }
    if (!req.body.name || !req.body.repassword || !req.body.repassword) {
      return next(new AppError("All fields are required", 400));
    }
    if (req.body.password != req.body.repassword) {
      return next(new AppError("Passwords don't match", 400));
    }
    // on register - registering the user and returning the object with token and user info
    const token = await register(userObj);
    res.status(200).json(token);
  })
);

authController.post(
  "/login",
  catchAsync(async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
      return next(new AppError("Please, provide email and password", 400));
    }
    const token = await login(req.body.email, req.body.password);
    res.status(200).json(token);
  })
);

authController.get("/logout", async (req, res) => {
  const token = req.token;
  // console.log(token);
  await logout(token);
  res.status(204).end();
});

authController.post(
  "/forgot-password",
  catchAsync(async (req, res, next) => {
    // 1. get user based on provided email
    console.log(req.body);
    const user = await getUserEmail(req.body.email);
    console.log(user);
    if(!user) {
      return next(new AppError('User with that email does not exist', 404));
    }
    // 2. generate a random token
    const resetToken = user.createPassResetToken();
    await updateUser(user._id, Object.assign(user, req.body));
    // validate before save is when the user reset his/her password and provides only the email, so the user don't need to specify the other required fields like name
    // await user.save({ validateBeforeSave: false});
    // 3. send token to user as an email

  })
);

authController.post("/reset-password", (req, res, next) => {});

module.exports = authController;
