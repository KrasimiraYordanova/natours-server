const express = require("express");
const templateConfig = require("./config/express");
const dbConnection = require("./config/database");
const routers = require("./config/routes");

start();

async function start() {
  const app = express();

  templateConfig(app);
  await dbConnection();
  routers(app);

  app.listen(3000, () =>
    console.log("Server is listening on port 3000")
  );
}
