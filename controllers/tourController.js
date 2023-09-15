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
      // filtering
      const queryObj = { ...req.query };
      const excludedFields = ["page", "sort", "limit", "fields"];
      excludedFields.forEach((el) => delete queryObj[el]);
      // console.log(req.query, queryObj);

      // advanced filtering
      // - converting the object to a string to be able to use the replace method
      let queryString = JSON.stringify(queryObj);
      // console.log(queryObj);
      queryString = queryString.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      console.log(JSON.parse(queryString));

      tours = await getTours(JSON.parse(queryString));
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
  if (req.user._id == tour._ownerId) {
    res.status(403).json({ message: "You cannot modify this record" });
  }
  try {
    const tour = await updateTour(req.params.id, req.body);
    res.json(tour);
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
