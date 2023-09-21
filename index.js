const express = require("express");
const templateConfig = require("./config/express");
const dbConnection = require("./config/database");
const routers = require("./config/routes");
const dotenv = require("dotenv");

start();

async function start() {
  process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);  
    process.exit(1);
  });

  // command - read our variables from the file and save them into nodejs
  dotenv.config({ path: "./config.env" });

  const app = express();
  // console.log(app.get('env'));
  // console.log(process.env);

  templateConfig(app);
  await dbConnection();
  routers(app);

  const port = process.env.PORT || 3030;
  const serverOn = app.listen(port, () =>
    console.log(`Server is listening on port ${port}`)
  );

  process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    // server closing giving it time to finish all pending request or being handles at the time
    serverOn.close(() => {
      process.exit(1);
    });
  });
}
