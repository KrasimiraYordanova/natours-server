const morgan = require("morgan");

const authController = require("../controllers/authController");
const tourController = require("../controllers/tourController");
const globalError = require("../middlewares/globalError");
const AppError = require("../util/appError");
const userController = require("../controllers/userController");

function routers(app) {
  
  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers);
    next();
  })

  app.use("/users", authController);
  app.use("/users", userController);
  app.use("/data/tours", tourController);

  app.all("*", (req, res, next) => {
    // res.status(404).json({status:"fail", message: `Can't find ${req.originalUrl} on this server`});

    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    // next(err);

    // invalid routes error handler
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  });

  // Global Error Handling Middleware
  // to define an error handling middlware all we need to do is to give the middlware function 4 arguments and express
  // will authomatically recognise it as an error handling middlware therefore calling it only when an error occurs
  app.use(globalError);
}

module.exports = routers;
