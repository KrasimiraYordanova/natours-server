const { catchAsync } = require("../middlewares/catchAsync");
const { hasUser } = require("../middlewares/guards");
const { getAllUsers, getUserId, updateUser, deleteUserId, updateData } = require("../services/userService");
const AppError = require("../util/appError");

const userController = require("express").Router();

// get all
userController.get('/', catchAsync(async(req, res, next) => {
    const users = await getAllUsers();
    res.status(200).json({status: 'success', result: users.length, users});
}))

userController.patch(
    "/update-data",
    hasUser(),
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
userController.get('/:id', catchAsync(async(req, res, next) => {
    const user = await getUserId(req.params.id);
    res.status(200).json({status: 'success', user});
}))

// update
userController.put('/:id', catchAsync(async(req, res, next)=> {
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
}));

// delete
userController.delete('/:id', catchAsync(async(req, res, next) => {
    // need to check is the user is admin or in case a user wants to delete his/her own account to check his/her id
    // alert window for confirmation
    await deleteUserId(req.params.id);
}))





module.exports = userController;