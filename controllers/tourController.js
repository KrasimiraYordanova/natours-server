const tourController = require("express").Router();

const { hasUser } = require("../middlewares/guards");
const {
  getTours,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  getToursByUserId,
} = require("../services/tourService");
const { parseError } = require("../util/parser");

tourController.get("/", async (req, res) => {
  let tours = [];
  try {
    if (req.query.where) {
      const userId = JSON.parse(req.query.where.split("=")[1]);
      tours = await getToursByUserId(userId);
    } else {
      // 1. filtering
      const queryObj = { ...req.query };
      const excludedFields = ["page", "sort", "limit", "fields"];
      excludedFields.forEach((el) => delete queryObj[el]);
      //   console.log(req.query, queryObj);

      // 2. advanced filtering
      // - converting the object to a string to be able to use the replace method
      let queryString = JSON.stringify(queryObj);
      // console.log(queryObj);
      queryString = queryString.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      //   console.log(JSON.parse(queryString));

      let specialQuery = {};
      // 3. Sorting
      if (req.query.sort) {
        specialQuery = req.query.sort.split(",").join(" ");
        console.log(specialQuery);
        tours = await getTours(JSON.parse(queryString), { sort: specialQuery });
      }
      // 4. Limiting
      else if (req.query.fields) {
        specialQuery = req.query.fields.split(",").join(" ");
        console.log(specialQuery);
        tours = await getTours(JSON.parse(queryString), { limitedFields: specialQuery });
      } else {
        // 5. Pagination
        const page = req.query.page * 1 || 1;
        const limitPerPage = req.query.limit * 1 || 10;
        const skipedItems = (page - 1) * limitPerPage;

        tours = await getTours(JSON.parse(queryString), {skip: skipedItems, limit: limitPerPage});
      }

      // tours = await getTours();
    }
    res
      .status(200)
      .json({ status: "success", results: tours.length, tours: tours });
  } catch (err) {
    console.log(err);
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
    res.status(400).json(tour);
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
