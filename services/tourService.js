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
  return Tour.findById(id).populate('reviews');

  // // done as a query middleware so it works for all get tour, get tours etc...
  // .populate({
  //   path: 'guides',
  //   select: '-__v -hashedPass'
  // });

}
// create
async function createTour(tour) {
  return Tour.create(tour);
}
// edit
async function updateTour(id, updatedTour) {
  // so mongoose validators can valid the new changes, othewise they will accept the changes even if they are wrong - findByIdAndUpdate method
  // const tour = Tour.findByIdAndUpdate(id, updatedTour, { new: true, runValidators: true });
  const tour = await Tour.findById(id);
  tour.name = updatedTour.name;
  tour.description = updatedTour.description;
  tour.duration = updatedTour.duration;
  tour.difficulty = updatedTour.difficulty;
  tour.price = updatedTour.price;
  tour.maxGroupSize = updatedTour.maxGroupSize;
  tour.ratingAverage = updatedTour.ratingAverage;

  return tour.save();
}
// delete
async function deleteTour(id) {
  return Tour.findByIdAndDelete(id);
}

// aggregating tour stats
async function aggregatingTourStats() {
  return (tourStats = Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        // _id: '$ratingAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingQuantity" },
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'MEDIUM' } }
    // }
  ]));
}

async function getMonthlyPlan(year) {
  return (monthlyPlan = Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // grouping by month - extracting the month with $month operator from the date field
      $group: {
        _id: { $month: '$startDates' },
        // number of tours in a given month
        numToursOfGivenMonth: { $sum: 1 },
        // which tours are in this month, need to be an array thats the way to specify few tours 
        toursOfMonth: { $push: '$name'}
      },
    },
    // adding a new field
    {
      $addFields: { month: '$_id'}
    },
    // removing the _id field, adding _id: 1
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numToursOfGivenMonth: -1}
    },
    // {
    //   $limit: 6
    // }
  ]));
}

module.exports = {
  getTours,
  getToursByUserId,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  aggregatingTourStats,
  getMonthlyPlan,
};
