const authController = require("../controllers/authController");
const dataController = require("../controllers/dataController");

function routers(app) {
  app.get("/", (req, res) => {
    res.json({ message: 'REST service operational' });
  });

  app.use('/users', authController);
  app.use('/data/tours', dataController);
}

module.exports = routers;