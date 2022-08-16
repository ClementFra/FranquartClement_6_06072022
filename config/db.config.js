const mongoose = require(`mongoose`);
const bunyan = require('bunyan');
require("dotenv").config();

if (!process.env.MONGO_URI){ //Error if MONGO_URI was not defined in .env
    console.log("MONGO_URI not found on .env !") // Error message log
}

const log = bunyan.createLogger({ // Create logger with the following options
  name: "MongoDB Driver",
  serializers: {
    dbQuery: serializer,
  },
  streams: [
    {
      stream: process.stdout,
      level: "info", // Log info
    },
    {
      stream: process.stdout,
      level: "debug", // Log debug
    },
    {
      stream: process.stderr,
      level: "error", // Log error 
    },
    {
      type: "rotating-file",
      path: "./logs/mongodb.log",
      period: "1d", // daily rotation
      count: 3, // keep 3 back copies
    },
  ],
});

function serializer(data) {
  let query = JSON.stringify(data.query);
  let options = JSON.stringify(data.options || {});

  return `db.${data.coll}.${data.method}(${query}, ${options});`;
}

mongoose.set("debug", function (coll, method, query, doc, options) {
  let set = {
    coll: coll,
    method: method,
    query: query,
    doc: doc,
    options: options
  };

  log.info({
    dbQuery: set
  });
});



mongoose // Connect to MongoDB and send a message
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true // Use SSL to connect MONGODB
  })
  .then(() => {
    console.log("Connection to database established "); // Succes log
  })
  .catch((error) => {
    console.log("Connection failed" + error); // Error log
  });

module.exports= mongoose.connection;
