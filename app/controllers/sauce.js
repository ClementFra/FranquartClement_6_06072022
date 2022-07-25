const Sauce = require("../models/sauce");


// Return the id of sauce

exports.readSingleSauce = (req, res, next) => {
  Sauce.findById(req.params.id)
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}${sauce.imageUrl}`;
      res.status(200).json(sauce);
    })
    .catch((error) =>
      res.status(404).json({
        error,
      })
    );
};


// Return the data table of all sauce

exports.readAllSauces = (req, res, next) => {
    Sauce.find()
      .then((sauces) => {
        sauces = sauces.map((sauce) => {
          sauce.imageUrl = `${req.protocol}://${req.get("host")}${
            sauce.imageUrl
          }`;
          return {...sauce._doc};
        });
        res.status(200).json(sauces);
      })
      .catch((error) => res.status(400).json({
        error
      }));
  };
