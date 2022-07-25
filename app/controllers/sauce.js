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
        return { ...sauce._doc };
      });
      res.status(200).json(sauces);
    })
    .catch((error) =>
      res.status(400).json({
        error,
      })
    );
};

// create and add a new sauce in the database

exports.createNewSauce = (req, res, next) => {
  if (!req.body.sauce) {
    return res.status(422).json({
      message: "Sauce not found !",
    });
  }
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `/images/${req.file.filename}`,
  });
  sauce
    .save()
    .then((newSauce) => res.status(201).json(newSauce))
    .catch((error) =>
      res.status(400).json({
        error,
      })
    );
};

// Create like or dislike

exports.likeOrDislike = (req, res, next) => {
  //  if the user like sauce
  if (req.body.like === 1) {
    // update 1 like & push the like in the table usersLiked
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { likes: req.body.like++ },
        $push: { usersLiked: req.body.userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Like ajouté !" }))
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like === -1) {
    // if the user dislike sauce
    // update 1 like & push the dislike in the table usersDisliked
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: req.body.like++ * -1 },
        $push: { usersDisliked: req.body.userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Dislike ajouté !" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    // if like == 0 the user remove the vote
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        // if the table userLiked have the id of the user
        if (sauce.usersLiked.includes(req.body.userId)) {
          // Remove the like in the table
          Sauce.updateOne(
            { _id: req.params.id },
            { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Like supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          // if the table userDisLiked have the id of the user
          // Remove the lie in the table
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Dislike supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
