const authController = require("../controllers/authController");
const tourController = require("../controllers/tourController");

function routers(app) {
  app.get("/", (req, res) => {
    res.json({ message: 'REST service operational' });
  });

  app.use('/users', authController);
  app.use('/data/tours', tourController)
  app.use('/*', () => {
    console.log("Page not found");
  })
}

module.exports = routers;