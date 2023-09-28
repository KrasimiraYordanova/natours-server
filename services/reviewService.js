const Review = require("../models/Review");

// get All reviews
async function getAllReviews(filterObject) {
  return Review.find(filterObject);
}

// get review
async function getReview(id) {
  return Review.findById(id);
}

// create review
async function createReview(review) {
  return Review.create(review);
}

// update review
async function updateReview(id, review) {
  return Review.findByIdAndUpdate(id, review, {
    new: true,
    runValidators: true,
  });
}

// delete
async function deleteReview(id) {
  return Review.findByIdAndDelete(id);
}

module.exports = {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
