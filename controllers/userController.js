const { catchAsync } = require("../middlewares/catchAsync");
const { updateUser } = require("../services/userService");

const userController = require("express").Router();

userController.put('/:id', catchAsync(async(req, res, next)=> {
    console.log(req.body);
    // const user = await updateUser(req.user.id);
}))

module.exports = userController;