const Tour = require("../models/Tour");

// all tours
async function getTours(queryString, queries) {
  let tours = Tour.find(queryString);
  if (queries) {
    for (let query of queries) {
      if (query.sort) {
        tours = tours.sort(query.sort);
      } else if (query.fields) {
        tours = tours.select(query.fields);
      } else if (query.skip) {
        tours = tours.skip(query.skip);
      } else if (query.limit) {
        tours = tours.limit(query.limit);
      }
    }
  }
  return tours;
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

// aggregating tour stats
async function aggregatingTourStats() {
  return tourStats = Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4 } } 
    },
    {
      $group: { 
        _id: { $toUpper: '$difficulty'},
        // _id: '$ratingAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage'},
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price'},
        maxPrice: { $max: '$price'},
       }
    },
    {
      $sort: { avgPrice: -1 }
    },
    // {
    //   $match: { _id: { $ne: 'MEDIUM' } }
    // }
  ]);
}

module.exports = {
  getTours,
  getToursByUserId,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  aggregatingTourStats,
};
