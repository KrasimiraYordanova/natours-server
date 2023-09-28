const { catchAsync } = require("../middlewares/catchAsync");
const { hasUser, isRestricted } = require("../middlewares/guards");
const {
  getAllUsers,
  getUserId,
  updateUser,
  updateData,
  deactivateAccount,
} = require("../services/userService");
const AppError = require("../util/appError");

const userController = require("express").Router();

// get all
userController.get(
  "/",
  catchAsync(async (req, res, next) => {
    const users = await getAllUsers();
    res.status(200).json({ status: "success", result: users.length, users });
  })
);

// get me
userController.get(
  "/me",
  hasUser(),
  catchAsync(async (req, res, next) => {
    const user = await getUserId(req.user._id);
    res.status(200).json({ status: "success", user });
  })
);

userController.patch(
  "/update-data",
  hasUser(), isRestricted('user'),
  catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.repassword) {
      return next(
        new AppError(
          "You cannot modify password. Please use update password link",
          400
        )
      );
    }
    const user = await getUserId(req.user._id);
    if (!user) {
      return next(new AppError("User does not exist", 400));
    }
    const updatedData = {
      fullName: req.body.name,
      email: req.body.email,
    };
    const updatedUser = await updateData(req.user._id, updatedData);

    res.status(200).json({ status: "success", updatedUser });
  })
);

// get by id
userController.get(
  "/:id", hasUser(), isRestricted('admin'),
  catchAsync(async (req, res, next) => {
    const user = await getUserId(req.params.id);
    res.status(200).json({ status: "success", user });
  })
);

// TO MODIFY
// update
userController.put(
  "/:id",
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    console.log(req.params.id);
    // if (!req.body.name || !req.body.email || !req.body.repassword || !req.body.repassword) {
    //   return next(new AppError("The fields are required", 400));
    // }
    if (req.body.password != req.body.repassword) {
      return next(new AppError("Passwords don't match", 400));
    }
    const user = await updateUser(req.params.id, req.body);
    res.status(200).json({ status: "success", user });
  })
);

// delete my account
userController.delete(
  "/delete-account",
  hasUser(), isRestricted('user'),
  catchAsync(async (req, res, next) => {
    // need to check if the user is admin or in case a user wants to delete his/her own account to check his/her id
    // alert window for confirmation
    await deactivateAccount(req.user._id);
    res.status(204).json({
      status: "success",
      message: "Your account was deactivated",
      data: null,
    });
  })
);

module.exports = userController;
