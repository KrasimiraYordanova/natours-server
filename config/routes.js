const authController = require("../controllers/authController");
const tourController = require("../controllers/tourController");
const topTours = require('../middlewares/topTours');

function routers(app) {
  app.get("/", (req, res) => {
    res.json({ message: 'REST service operational' });
  });

  app.use('/users', authController);
  app.use('/data/tours', tourController);
  // app.use('/data/tours/top-3-tours', topTours, tourController);
  app.use('/*', () => {
    console.log("Page not found");
  })
}

module.exports = routers;