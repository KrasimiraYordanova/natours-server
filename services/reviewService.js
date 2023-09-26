const Review = require("../models/Review");

// get All reviews
async function getAllReviews() {
  return Review.find();
}

async function createReview(review) {
    return Review.create(review);
}


module.exports = {
    getAllReviews,
    createReview,
}