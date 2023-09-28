const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const Tour = require("./Tour");

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
  this.populate({ path: "user", select: "fullName photo" });
  //   this.populate({ path: "tour", select: 'name' }).populate({ path: "user", select: 'fullName photo' });
  next();
});

// function calculating the average rating for a tour each time a review has been added or deleted and insert it as a middleware when new review
// returns a promise
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numberOfReviews: { $sum: 1 },
        avrgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingAverage: stats[0].avrgRating,
    ratingQuantity: stats[0].numberOfReviews,
  });
};

// DOCUMENT MIDDLEWARE
// document middleware - saving and calculating the averageRating for each tour every time a review has been add or deleted
// the "post" middleware does not get access to next()
reviewSchema.post("save", function () {
  // "this" points to current document
  // "this.constructor" is the current model which calls to calculateAverageRating for the given tour
  this.constructor.calcAverageRatings(this.tour);
});

// QUERY MIDDLEWARE ONLY FOR UPDATE AND DELETE, DON'T HAVE DOCUMENT MIDDLEWARE FOR THOSE
// in the query we don't have direct access to the document in order to then do something similar to what we did with the document middleware
// but we can go around this limitation by creating a pre middleware for those hooks/events
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // the goal is to access the current review document but here the "this" keyword is pointing to the current query
  // we can basically execute the query and it will give us the doc currently processed
  this.revu = await this.clone().findOne(); // passing the variable down to post query middleware function
  next();
});

reviewSchema.post(/^findOneAnd/, async function(doc) {
  console.log(doc);
  await this.revu.constructor.calcAverageRatings(doc.tour);
});

// restricting user to post more than one message for a tour - review where the user and tour are unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = model("Review", reviewSchema);
module.exports = Review;
