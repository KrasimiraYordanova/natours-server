const Tour = require("../models/Tour");

// all tours
async function getTours(queryObj) {
  const query = Tour.find(queryObj);
  return query;
}
// tours by user Id
async function getToursByUserId(userId) {
    return Tour.find({_ownerId: userId});
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
    const tour =  await Tour.findById(id);
    tour.name = updatedTour.name;
    tour.description = updatedTour.description;
    tour.duration = updatedTour.duration;
    tour.difficulty = updatedTour.difficulty;
    tour.price = updatedTour.price;
    tour.maxGroupSize = updatedTour.maxGroupSize

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
