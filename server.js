// Define variables extensions
const express = require("express");
const cors = require("cors");
require("./config/db.config");
require("dotenv").config();

//Settings corps
const app = express();
var corsOptions = {
  origin: "http://localhost:4200/",
};

//middleware corps
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Welcome to piiquante application." });
});

// Port listener for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


