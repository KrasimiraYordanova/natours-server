const { catchAsync } = require("../middlewares/catchAsync");
const AppError = require("./appError");

function deleteOne(serviceFunction) {
  return catchAsync(async (req, res, next) => {
    const document = await serviceFunction(id);
    if (!document) {
      return next(new AppError(`The document with the id does not exist`, 404));
    }
    res.status(204).json({
        status: "success",
        data: null,
        message: "Your document has been deleted"
    });
  });
}

module.exports = {
    deleteOne,
}