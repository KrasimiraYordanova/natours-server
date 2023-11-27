const authController = require("express").Router();

const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const {
  register,
  login,
  logout,
  getUserTokenandUpdatePass,
  saveUserTokenOnEmailProvide,
  updatePassword,
} = require("../services/authService");
const { getUserEmail, getUserId } = require("../services/userService");

const { catchAsync } = require("../middlewares/catchAsync");
const { hasUser, isGuest } = require("../middlewares/guards");
const AppError = require("../util/appError");
const sendEmail = require("../util/email");

authController.post(
  "/register", isGuest(),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  catchAsync(async (req, res, next) => {
    const userObj = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    };
    // catching the errros from express-validator
    const { errors } = validationResult(req);
    const errorsString = errors.map((obj) => obj.msg).join(", ");
    if (errors.length > 0) {
      return next(new AppError(errorsString, 400));
    }
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.rePassword) {
      return next(new AppError("All fields are required", 400));
    }
    if (req.body.password != req.body.rePassword) {
      return next(new AppError("Passwords don't match", 400));
    }
    // on register - registering the user and returning the object with token and user info
    const token = await register(userObj);

    // // secure: true - sent only on https, secured connection - only in production, during dev won't work
    // // httpOnly: true - the cookie caanot be accessed or modified by the browser - xxs attacks
    // // cookie() - cookie name, cookie token string, cookie options -> {}

    res.cookie("jwt", token.accessToken, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      // sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });

    res.status(200).json(token);
  })
);

authController.post(
  "/login", isGuest(),
  catchAsync(async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
      return next(new AppError("Please, provide email and password", 400));
    }
    const { email, password } = req.body;
    const token = await login( email, password );

    res.cookie("jwt", token.accessToken, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      // sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
    res.status(200).json(token);
  })
);

authController.post("/logout", async (req, res) => {
  const token = req.token;
  // console.log(token);
  res.clearCookie('jwt');
  // await logout(token);
  res.status(204).end();
});

authController.post(
  "/forgot-password",
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    // 1. get user based on provided email
    const user = await getUserEmail(req.body.email);
    if (!user) {
      return next(new AppError("User with that email does not exist", 404));
    }

    // 2. generate a random token
    const resetToken = user.createPassResetToken();
    // validate before save is when the user reset his/her password and provides only the email, so the user don't need to specify the other required fields like name or password
    // await user.save({ validateBeforeSave: false});
    console.log(user);
    await saveUserTokenOnEmailProvide(user._id, user);

    // 3. send token to user as an email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a request with your new password and confirm it to: ${resetURL}.\nIf the request is not from you, please ignore this email!`;
    try {
      await sendEmail({
        email: user.email,
        subject:
          "Request for password reset: your password reset token (valid for 10 min)",
        message,
      });
      res
        .status(200)
        .json({ status: success, message: "Token sent to your email" });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiration = undefined;
      await saveUserTokenOnEmailProvide(user._id, user);

      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  })
);

authController.patch(
  "/reset-password/:token",
  catchAsync(async (req, res, next) => {
    // 1. get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const token = await getUserTokenandUpdatePass(
      hashedToken,
      req.body.password
    );
    res.status(200).json(token);
  })
);

// updating our own password
authController.patch(
  "/update-password", hasUser(),
  hasUser(),
  catchAsync(async (req, res, next) => {
    // 1. get user from the collection
    const user = await getUserId(req.user._id);
    if (req.body.newPassword != req.body.reNewPassword) {
      return next(new AppError("Passwords don't match", 400));
    }

    // 2. check if password is correct
    if (!(await bcrypt.compare(req.body.password, user.hashedPass))) {
      return next(new AppError("Your current password is wrong", 401));
    }
    user.hashedPass = req.body.newPassword;
    // 3. if so update pass +  // 4. log user in
    const token = await updatePassword(user._id, user);
    res.status(200).json(token);
  })
);

module.exports = authController;
