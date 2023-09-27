const Review = require("../models/Review");

// get All reviews
async function getAllReviews(filterObject) {
  return Review.find(filterObject);
}

async function createReview(review) {
    return Review.create(review);
}

// delete
async function deleteReview(id) {
  return Review.findByIdAndDelete(id);
}


module.exports = {
    getAllReviews,
    createReview,
    deleteReview
}