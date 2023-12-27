const { catchAsync } = require("../middlewares/catchAsync");
const { hasUser, isRestricted } = require("../middlewares/guards");
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
} = require("../services/reviewService");
const { getTourBySlug } = require("../services/tourService");
const AppError = require("../util/appError");
const { deleteOne } = require("../util/handlerFactoryFunction");

const reviewController = require("express").Router({ mergeParams: true });

// get all reviews
reviewController.get(
  "/",
  catchAsync(async (req, res, next) => {
    let tour = await getTourBySlug(req.params.slug);
    let filterObject = {};
    if (req.params.slug && tour) filterObject = { tour: tour._id };
    const reviews = await getAllReviews(filterObject);
    res
      .status(200)
      .json({ status: "success", result: reviews.length, reviews });
  })
);

reviewController.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    let rev = await getReview(req.params.id);
    if (!rev) {
      return next(new AppError("No document found with that id", 404));
    }
    res.status(200).json({ message: "success", rev });
  })
);

// create a review
reviewController.post(
  "/",
  hasUser(),
  isRestricted("user"),
  catchAsync(async (req, res, next) => {
    let tour = await getTourBySlug(req.params.slug);
    const newReview = {
      review: req.body.review,
      rating: req.body.rating,
      user: req.user._id,
      tour: tour._id,
    };
    const review = await createReview(newReview);
    res.status(201).json({
      status: "success",
      review,
    });
  })
);

// update a review
reviewController.patch(
  "/:id",
  hasUser(),
  isRestricted("user"),
  catchAsync(async (req, res, next) => {
    const rev = await getReview(req.params.id);
    if (req.user._id != rev.user._id) {
      return next(new AppError("You cannot modify this record", 403));
    }
    const updatedReview = {
      review: req.body.review,
      rating: req.body.rating
    };
    const review = await updateReview(req.params.id, updatedReview);
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
      message: "Your document has been deleted",
    });
  })
);

// reviewController.delete('/:id', hasUser(), isRestricted('user'), deleteOne(deleteReview(req.params.id)))

module.exports = reviewController;
