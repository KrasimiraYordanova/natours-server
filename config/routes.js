const authController = require("../controllers/authController");

function routers(app) {
  app.get("/", (req, res) => {
    res.json({ message: 'REST service operational' });
  });
  
  app.use('/users', authController);
}

module.exports = routers;