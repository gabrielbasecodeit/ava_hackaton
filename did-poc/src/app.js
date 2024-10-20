const express = require("express");
const config = require("./config/config");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const balanceRouter = require("./routes/balance");

const app = express();

app.use("/", indexRouter);
app.use("/", authRouter);
app.use('/', balanceRouter);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});