const { catchAsync } = require("../middlewares/catchAsync");
const { hasUser, isRestricted } = require("../middlewares/guards");
const { getAllReviews, createReview, deleteReview } = require("../services/reviewService");
const AppError = require("../util/appError");
const { deleteOne } = require("../util/handlerFactoryFunction");

const reviewController = require("express").Router({ mergeParams: true });


// get all reviews
reviewController.get(
  "/",
  catchAsync(async (req, res, next) => {
    let filterObject = {};
    if(req.params.tourId) filterObject = {tour: req.params.tourId};

    const reviews = await getAllReviews(filterObject);
    res
      .status(200)
      .json({ status: "success", result: reviews.length, reviews });
  })
);

// create a review
reviewController.post(
  "/", hasUser(), isRestricted('user'),
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newReview = {
      review: req.body.review,
      rating: req.body.rating,
      user: req.user._id,
      tour: req.params.tourId,
    };
    console.log(newReview);
    const review = await createReview(newReview);
    res.status(201).json({
      status: "success",
      review,
    });
  })
);

reviewController.delete(
  "/:id",
  hasUser(),
  isRestricted("user"),
  catchAsync(async (req, res, next) => {
    const review = await deleteReview(req.params.id);
    if (!review) {
      return next(new AppError("The document with the id does not exist", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
      message: "Your document has been deleted"
    });
  })
);

// reviewController.delete('/:id', hasUser(), isRestricted('user'), deleteOne(deleteReview(req.params.id)))

module.exports = reviewController;