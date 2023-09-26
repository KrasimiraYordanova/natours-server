const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    //   parent referencing
    tour: {
      type: ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  // when we have a verual propety, a field that is not stored in a database , but calculated using some other values, we want this also to show up whenever there is an output
  {
    toJSON: { vertuals: true },
    toObject: { vertuals: true },
  }
);

// populating the current query
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: 'fullName photo' });
//   this.populate({ path: "tour", select: 'name' }).populate({ path: "user", select: 'fullName photo' });
  next();
});

const Review = model("Review", reviewSchema);
module.exports = Review;
