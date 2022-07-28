const Sauce = require("../models/sauce");
const fs = require("fs");

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

// Create and add a new sauce in the database

exports.createNewSauce = (req, res, next) => {
  if (!req.body.sauce) {
    return res.status(422).json({
      message: "Sauce not found !",
    });
  }
  // Creation new model sauce
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `/images/${req.file.filename}`,
  });
  // Recording new object in the database
  sauce
    .save()
    .then((newSauce) => res.status(201).json( sauce ))
    .catch((error) =>
      res.status(400).json({
        error,
      })
    );
};

//Modify sauce

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? // If the picture exist
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename}`,
      } : { ...req.body };
  //If the pictures don't exist
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject}
  )
    .then((newSauce) => res.status(200).json(newSauce))
    .catch((error) => res.status(400).json({ error }));
};

// Delete sauce

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce.userId !== req.auth.userId) {
     return res.status(403).json({
        error: new Error("non-authorization !"),
      });
    }
      const filename = sauce.imageUrl.split("/images/")[1];
      // Delete
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(204).send())
          .catch((error) => res.status(400).json({ error }));
      });
  });
};

// Create like or dislike

exports.likeOrDislike = (req, res, next) => {
  Sauce.findById(req.params.id)
  let toChange= {}
  .then((sauce)=>{
     const userId= req.auth.userId;
    switch(req.body.like){
      case -1:
        toChange= {
          $inc: { dislikes:1},
          $push: { usersDisliked: userId}
        }
        if(sauce.userLiked.includes(userId)){
           toChange= {
            $inc: { dislikes:1, likes:-1},
            $push: { usersDisliked: userId},
            $pull:{userLiked: userId}
          }
        }
        if(!sauce.userDisliked.includes(userId)){
          Sauce.updateOne(
            { _id: req.params.id },
            toChange
          )
            .then((newSauce) => res.status(200).json(newSauce))
            .catch((error) => res.status(400).json({
              error
            }));
        }
        break;
      case 0:
        if(sauce.userLiked.includes(userId) && sauce.userDisliked.includes(userId) ){
           toChange= {
            $inc: { dislikes: -1, likes: -1},
            $pull:{usersliked: userId,userDisliked: userId}
          }
          .then((newSauce) => res.status(200).json(newSauce))
          .catch((error) => res.status(400).json({
              error
            }));
        }
        if(sauce.userliked.includes(userId)){
          Sauce.updateOne(
            { _id: req.params.id },
            toChange= {
              $inc: {likes: -1},
              $pull:{usersliked: userId}
            }
          )
            .then((newSauce) => res.status(200).json(newSauce))
            .catch((error) => res.status(400).json({
              error
            }));
        }
        if(sauce.userDisliked.includes(userId)){
          toChange= {
            $inc: { dislikes: -1},
            $pull:{userDisliked: userId}
          }
          .then((newSauce) => res.status(200).json(newSauce))
          .catch((error) => res.status(400).json({
            error
          }));
        }
        break;
      case 1:
         toChange= {
          $inc: { likes:1},
          $push: { usersliked: userId}
        }
        if(sauce.userLiked.includes(userId)){
           toChange= {
            $inc: { dislikes: -1, likes: 1},
            $push: { usersliked: userId},
            $pull:{userDisliked: userId}
          }
        }
        if(!sauce.userliked.includes(userId)){
          Sauce.updateOne(
            { _id: req.params.id },
            toChange
          )
            .then((newSauce) => res.status(200).json(newSauce))
            .catch((error) => res.status(400).json({
              error
            }));
        }
        break;
    }
  })
  .catch((error) => res.status(404).json({ error }));
};
