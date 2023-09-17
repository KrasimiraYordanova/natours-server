const tourController = require("express").Router();

const { hasUser } = require("../middlewares/guards");
const {
  getTours,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  aggregatingTourStats,
  getMonthlyPlan,
} = require("../services/tourService");
const { parseError } = require("../util/parser");

tourController.get("/", async (req, res) => {
  let tours = [];
  try {
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
  } catch (err) {
    console.log(err);
  }
});

tourController.get("/tour-stats", async (req, res) => {
  try {
    const stats = await aggregatingTourStats();
    res.status(200).json({ status: "success", stats });
  } catch (err) {
    res
      .status(404)
      .json({ status: "fail", message: err });
  }
});

tourController.get("/monthly-plan/:year", async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await getMonthlyPlan(year);
    res.status(200).json({ status: "success", plan });
  } catch (err) {
    res
      .status(404)
      .json({ status: "fail", message: err });
  }
});

tourController.post("/", hasUser(), async (req, res) => {
  try {
    let tour = Object.assign(
      { _ownerId: "6501a303154f3cfe39f95bb5" },
      req.body
    );
    tour = await createTour(tour);
    res.json(tour);
  } catch (err) {
    const message = parseError(err);
    res.status(400).json({ message: message });
  }
});

tourController.get("/:id", async (req, res) => {
  try {
    let tour = await getTourById(req.params.id);
    res.json(tour);
  } catch (err) {
    const message = parseError(err);
    res.status(400).json({ message: message });
  }
});

tourController.put("/:id", hasUser(), async (req, res) => {
  const tour = await getTourById(req.params.id);
  if (req.user._id != tour._ownerId) {
    res.status(403).json({ message: "You cannot modify this record" });
  }
  try {
    const tour = await updateTour(req.params.id, req.body);
    res.status(200).json(tour);
  } catch (err) {
    const message = parseError(err);
    res.status(400).json({ message: message });
  }
});

tourController.delete("/:id", hasUser, async (req, res) => {
  const tour = await getTourById(req.params.id);
  if (req.user._id == tour._ownerId) {
    res.status(403).json({ message: "You cannot modify this record" });
  }
  try {
    await deleteTour(req.params.id);
    res.status(204).end();
  } catch (err) {
    const message = parseError(err);
    res.status(400).json({ message: message });
  }
});

module.exports = tourController;
