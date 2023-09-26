const { catchAsync } = require("../middlewares/catchAsync");
const { hasUser, isRestricted } = require("../middlewares/guards");
const { getAllReviews, createReview } = require("../services/reviewService");

const reviewController = require("express").Router();

// get all reviews
reviewController.get(
  "/",
  catchAsync(async (req, res, next) => {
    const reviews = await getAllReviews();
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
      tour: req.body.tour,
    };
    console.log(newReview);
    const review = await createReview(newReview);
    res.status(201).json({
      status: "success",
      review,
    });
  })
);

module.exports = reviewController;