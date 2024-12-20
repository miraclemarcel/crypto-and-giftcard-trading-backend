const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const requestIp = require("request-ip");
const morgan = require("morgan");
const mongoose = require("mongoose");
// const rate_Limit = require('express-rate-limit')
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const createWebSocketServer = require("./notifications/transactionNotification");
const compression = require("compression");
const cors = require("cors");

dotenv.config({ path: "./config.env" });

const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};

const userRouter = require("./routes/userRouter");
const AppError = require("./routes/utills/AppError");
const Admin = require("./routes/dashboard.js");
const globalHandler = require("./controller/ErrorController");
const transactionRouter = require("./routes/transactionRouter");
const notifications = require("./routes/webHooks");

const app = express();
const server = require("https").createServer(app);
const port = process.env.SERVER_PORT || 1234;

// const db = process.env.personal_cloud;
// const DB = db.replace("<password>", process.env.personal_pass);
// console.log(DB);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://personalemail8000:SirUPUcchBtIu3wM@skyshow.yqgndns.mongodb.net/SKYSHOWNG",
      {
        family: 4,
        useNewUrlParser: true,
      }
    );
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

app.get("/api/V1/skyshowNG", (req, res) => {
  res.status(200).send(" Welcome To Skyshow Mobile Application");
});

// GLOBAL MIDLEWARE

app.use(cors(corsOptions));

app.use(compression());

// Set HTTP Headers
app.use(helmet());

// get the client ip
app.use(requestIp.mw());

// Development loging
app.use(morgan("dev"));

app.enable("trust proxy");
// Limit request from same api
// const limiter = rate_Limit({
//     max: 100,
//     windowMs: 60 * 60 * 100,
//     message: new AppError('Too many request from this server', 403)
// })
// app.use('/api', limiter)

// Body perser, reading data from body into req.body
app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// Data sanitization against NoSql query enjection
app.use(mongoSanitize());

// Data Sanitization agains XSS
app.use(xss());

app.use("/api/V1/skyshowNG", userRouter);
app.use("/api/V1/skyshowNG", transactionRouter);
app.use("/api/V1/skyshowNG", Admin);
app.use("/notify", notifications);

app.all("*", (req, res, next) => {
  return next(
    new AppError(`cant find this ${req.originalUrl} on this server`, 200)
  );
});

app.use(globalHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server Runing On Port: ${port}`);
  });
});
