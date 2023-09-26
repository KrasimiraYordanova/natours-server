const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const slugify = require("slugify");
// const validator = require('validator');
// const User = require('./User');

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "Tour name must be 40 characters max"],
      minlength: [10, "Tour name must be 10 characters min"],
      // validator: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    ratingAverage: {
      type: Number,
      // default: 4.5,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 6"],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        300,
        "A tour description must have less or equal then 40 characters",
      ],
      minlength: [
        10,
        "A tour description must have more or equal then 10 characters",
      ],
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      // passing values that are allowed
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
      min: [1, "Price must be a valid positive number"],
    },
    priceDiscount: {
      type: Number,
      // custom validation to see if the discount price is less than the regular price
      validate: {
        validator: function (discountPrice) {
          // inside a validator function the 'this' here will work, point to the current document, only when we create the document, but not when we udate it
          return discountPrice < this.price;
        },
        message: 'Discount price ({VALUE}) must be less than the regular price'
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    _ownerId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array,
    guides: [
      {type: ObjectId, ref: "User"}
    ]
  },
  // for the vertual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// defining vertual property
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// vertual populate
tourSchema.virtual("reviews", {
  ref: "Review", 
  // the name of the field sotred into Review model
  foreignField: 'tour',
  // the nae if the field inside Tour model
  localField: "_id"
}) 

// DOCUMENT MIDDLEWARE: runs before - the actual document is saved to the database - .save() and .create() (only on those two), not on update()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// wa can have multiples pre and post middlewares for the same hook('save')
tourSchema.post("save", function (savedDocument, next) {
  // console.log(savedDocument);
  next();
});

// // example of embedding documents if we want to use it
// // if we want to embed documents into tour documents
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id)); // this return all promises
//   this.guides = await Promise.all(guidesPromises); // returns array of users
//   next();
// })

// QUERY MIDDLEWARE: before or after a certain query is executed
// the this keyword point to the current query, not the current document as inside the document middleware, because of the "find" hook it diferenciate them
// for find, findOne, findOneById et...
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });

  // we can set a value and catch in the 'post' query middleware
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  // catching the value from 'pre' query middleware
  // console.log(`Query took ${Date.now() - this.start} milliseconds!`);

  // console.log(doc);
  next();
});

// populating model with referenced data
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -hashedPass'
  });
  next();
});

// AGGREGATION MIDDLEWARE
// excluding the aggregation middleware for secret tour so we don't have to repeat the code
tourSchema.pre("aggregate", function (next) {
  // an array from which we put in front another $match
  // console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

const Tour = model("Tour", tourSchema);
module.exports = Tour;
