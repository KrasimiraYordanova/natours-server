const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const slugify = require("slugify");

const tourSchema = new Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "Tour name must be 40 characters max"],
    minlength: [10, "Tour name must be 10 characters min"],
  },
  slug: String,
  ratingAverage: {
    type: Number,
    default: 4.5
  },
  ratingQuantity: {
    type: Number,
    default: 0
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
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
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
  priceDiscount: Number,
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
      default: Date.now
    },
    startDates: [Date]
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Tour = model("Tour", tourSchema);
module.exports = Tour;
