const tourController = require("express").Router();

const AppError = require("../util/appError");
const { catchAsync } = require("../middlewares/catchAsync");
const { hasUser, isRestricted } = require("../middlewares/guards");
const {
  getTours,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  aggregatingTourStats,
  getMonthlyPlan,
} = require("../services/tourService");
const { createReview } = require("../services/reviewService");
const reviewController = require("./reviewController");
const { deleteOne } = require("../util/handlerFactoryFunction");

tourController.use("/:tourId/reviews", reviewController);
tourController.use("/:tourId/reviews", reviewController);

tourController.get(
  "/",
  hasUser(),
  catchAsync(async (req, res, next) => {
    let tours = [];
    // if (req.query.where) {
    //   const userId = JSON.parse(req.query.where.split("=")[1]);
    //   tours = await getToursByUserId(userId);
    // }

    // 1.A filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log(req.query, queryObj);

    // 1.B advanced filtering
    // - converting the object to a string to be able to use the replace method
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    // console.log(JSON.parse(queryString));

    tours = getTours(JSON.parse(queryString));
    let queries = [{}];

    // 2. sorting

    if (
      req.query.sort ||
      req.query.fields ||
      req.query.page ||
      req.query.limit
    ) {
      if (req.query.sort) {
        const sortQuery = req.query.sort.split(",").join(" ");
        queries.push({ sort: sortQuery });
      }
      console.log(queries);
      // 3. fields limit
      if (req.query.fields) {
        const fieldsQuery = req.query.fields.split(",").join(" ");
        queries.push({ fields: fieldsQuery });
      }
      console.log(queries);
      // 4. pagination
      if (req.query.page || req.query.limit) {
        let page = req.query.page * 1 || 1;
        let limit = req.query.limit * 1 || 90;
        let skip = (page - 1) * limit;
        queries.push({ skip }, { limit });
      }
      console.log(queries);
      tours = getTours(JSON.parse(queryString), queries);
    }

    tours = await tours;
    res
      .status(200)
      .json({ status: "success", results: tours.length, tours: tours });
  })
);

tourController.get("/tour-stats", async (req, res, next) => {
  const stats = await aggregatingTourStats();
  res.status(200).json({ status: "success", stats });
});

tourController.get("/monthly-plan/:year", async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await getMonthlyPlan(year);
  res.status(200).json({ status: "success", plan });
});

tourController.post(
  "/",
  catchAsync(async (req, res, next) => {
    let tour = Object.assign(
      { _ownerId: "6501a303154f3cfe39f95bb5" },
      req.body
    );
    tour = await createTour(tour);
    res.statusCode(200).json(tour);
  })
);

tourController.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    let tour = await getTourById(req.params.id);
    if (!tour) {
      return next(new AppError("No tour found with that id", 404));
    }
    res.status(200).json({ message: "success", tour });
  })
);

tourController.put(
  "/:id",
  catchAsync(async (req, res, next) => {
    // const tour = await getTourById(req.params.id);
    // if (req.user._id != tour._ownerId) {
    //   res.status(403).json({ message: "You cannot modify this record" });
    // }
    const tour = await updateTour(req.params.id, req.body);
    if (!tour) {
      return next(new AppError("No tour found with that id", 404));
    }
    res.status(200).json(tour);
  })
);

tourController.delete(
  "/:id",
  hasUser(),
  isRestricted("user"),
  catchAsync(async (req, res, next) => {
    // const tour = await getTourById(req.params.id);
    // if (req.user._id == tour._ownerId) {
    //   res.status(403).json({ message: "You cannot modify this record" });
    // }

    const tour = await deleteTour(req.params.id);
    if (!tour) {
      return next(new AppError("The tour with the id does not exist", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
      message: "Your document has been deleted"
    });
  })
);

// tourController.delete('/:id', hasUser(), isRestricted('user'), deleteOne(deleteTour(id)))

// // create a router for the selected tour
// tourController.post(
//   "/:tourId/reviews",
//   hasUser(),
//   isRestricted("user"),
//   catchAsync(async (req, res, next) => {
//     console.log(req.body);
//     console.log(req.params.tourId);
//     console.log(req.user._id);

//     const newReview = {
//       review: req.body.review,
//       rating: req.body.rating,
//       user: req.user._id,
//       tour: req.params.tourId,
//     };

//     console.log(newReview);
//     const review = await createReview(newReview);
//     res.status(201).json({
//       status: "success",
//       review,
//     });
//   })
// );

module.exports = tourController;
