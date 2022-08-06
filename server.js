// Define variables extensions
const express = require("express");
const cors = require("cors");
require("./config/db.config");
require("dotenv").config();
const app = express();
const router = require("./app/routes/index");
const hateoasLinker = require("express-hateoas-links");

// Security

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const speedLimiter = require("./app/middleware/speed-limiter");

// Path module for interaction files

const path = require("path");

// Setting headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


// Settings cors
var corsOptions = {
  origin: "http://localhost:4200/",
};

// Middleware corps
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
app.use(hateoasLinker);

// Security app

app.use(mongoSanitize());
app.use(helmet());
app.use(speedLimiter);

// Path for images

app.use("/images", express.static(path.join(__dirname, "images")));

// Port listener for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
