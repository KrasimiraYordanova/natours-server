const Tour = require("../models/Tour");

// all tours
async function getTours(queryString, specialQuery) {
  let query = Tour.find(queryString);
  if (specialQuery) {
    if (specialQuery.sort) {
      query = query.sort(specialQuery.sort);
    } else if (specialQuery.limitedFields) {
      query = query.select(specialQuery.limitedFields);
    } else {
      query = Tour.find(queryString)
        .sort("-createdAt")
        .skip(specialQuery.skip)
        .limit(specialQuery.limit);
    }
  }
  return query;
}
// tours by user Id
async function getToursByUserId(userId) {
  return Tour.find({ _ownerId: userId });
}
// tour by id
async function getTourById(id) {
  return Tour.findById(id);
}
// create
async function createTour(tour) {
  return Tour.create(tour);
}
// edit
async function updateTour(id, updatedTour) {
  const tour = await Tour.findById(id);
  tour.name = updatedTour.name;
  tour.description = updatedTour.description;
  tour.duration = updatedTour.duration;
  tour.difficulty = updatedTour.difficulty;
  tour.price = updatedTour.price;
  tour.maxGroupSize = updatedTour.maxGroupSize;

  return tour.save();
}
// delete
async function deleteTour(id) {
  return Tour.findByIdAndDelete(id);
}

module.exports = {
  getTours,
  getToursByUserId,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
};
