// Import the sauce model
const Sauce = require("../models/sauce");
// File system
const fs = require("fs");

/*****************************************************************
 *****************  READ SAUCE BY  ID     ************************
 *****************************************************************/
exports.readSingleSauce = (req, res, next) => {
  Sauce.findById(req.params.id) // Find the sauce in database
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}${sauce.imageUrl}`; // Add image URL
      sauce.links= hateoasLinks(req,sauce._id);
      res.status(200).json(sauce); // Request ok
    })
    .catch((error) =>
      res.status(404).json({error}) // Error not found
    );
};

/*****************************************************************
 *****************  READ ALL THE SAUCES      *********************
 *****************************************************************/
exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl = `${req.protocol}://${req.get("host")}${sauce.imageUrl}`; // Add image URL
        sauce.links = hateoasLinks(req, sauce._id);
        return { ...sauce._doc ,hateoasLinks };
      });
      res.status(200).json(sauces); // Request ok
    })
    .catch((error) =>
      res.status(400).json({error}) // Error not found
    );
};

/*****************************************************************
 *****************    CREATE NEW SAUCE       *********************
 *****************************************************************/
exports.createNewSauce = (req, res, next) => {
  // Creation new model sauce
  const sauceObject = JSON.parse(req.body.sauce); // Get the sauce object
  delete sauceObject._id; // Delete the id
  const sauce = new Sauce({
    ...sauceObject, // Add the sauce object
    userId: req.auth.userId,
    imageUrl: `/images/${req.file.filename}`,
  });
  // Create new sauce
  sauce
    .save()
    .then(() =>
     Sauce.link= hateoasLinks(req, Sauce._id),
     res.status(201).json(Sauce)) // Request ok  sauce created
    .catch((error) =>res.status(400).json({error}) // Error bad request
    );
};

/*****************************************************************
 *****************  MODIFY ELEMENT IN  SAUCE    ******************
 *****************************************************************/
exports.modifySauce = (req, res, next) => {
  Sauce.findById(req.params.id).then((sauce) => {
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        message: "Unauthorized request!", // If the user is not the creator => unauthorized message
      });
    } else {
      const sauceObject = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `/images/${req.file.filename}`,
          } : {...req.body }; 
      const filename = sauce.imageUrl.split("/images/")[1];
      try {
        if (sauceObject.imageUrl) {
          fs.unlinkSync(`images/${filename}`); //Delete old image
        }
      } catch (error) {
        console.log(error);
      }
      Sauce.findByIdAndUpdate(
        {
          _id: req.params.id,
        },
        {
          ...sauceObject,
          _id: req.params.id,
        }, {
          new: true,
        }
      )
        .then((sauce) =>
        sauce.links= hateoasLinks(req, sauce._id),
        res.status(200).json(sauce)) // Request ok
        .catch((error) => res.status(400).json({error})); // Error bad request
    }
  });
};

/*****************************************************************
 *****************     DELETE THE SAUCE         ******************
 *****************************************************************/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // Find sauce
  .then((sauce) => {
    if (sauce.userId !== req.auth.userId) {
      return res.status(403).json({message: "non-authorization !"}); // If the user is not the creator => unauthorized message
    }
    const filename = sauce.imageUrl.split("/images/")[1];
    // Delete
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(204).send()) // No content
        .catch((error) => res.status(400).json({ error })); // Error bad request
    });
  });
};

/*****************************************************************
 *****************  LIKE OR DISLIKE A SAUCE    *******************
 *****************************************************************/
exports.likeOrDislike = (req, res, next) => {
  Sauce.findById(req.params.id)
    .then((sauceFound) => {
      const userId = req.auth.userId;
      const usersLikedExists = sauceFound.usersLiked.includes(userId);
      const usersDislikedExists = sauceFound.usersDisliked.includes(userId);
      let toChange = {};
      switch (req.body.like) {
        case -1:
          toChange = {
            $inc: {dislikes: 1 }, // Add a dislike
            $push: { usersDisliked: userId } // Add the user to the list of users disliked
          };
          if (usersLikedExists) {
            toChange = {
              $inc: {dislikes: 1,likes: -1}, // Add a dislike and remove a like
              $push: {usersDisliked: userId},
              $pull: {usersLiked: userId}
            };
          }
          if (!usersDislikedExists) {
            Sauce.findByIdAndUpdate({
                _id: req.params.id
              }, toChange, {
                new: true
              })
              .then((sauceUpdated) =>
              sauceUpdated.links= hateoasLinks(req,sauce._id),
              res.status(200).json(sauceUpdated)) // Request ok
              .catch((error) => res.status(400).json({error})); // Error bad request
          } else {
            res
              .status(200)
              .json({message: "User has already disliked the sauce"});
          }
          break;
        case 0:
          if (usersLikedExists && usersDislikedExists) {
            Sauce.findByIdAndUpdate({
                  _id: req.params.id
                },
                (toChange = {
                  $inc: {dislikes: -1,likes: -1},
                  $pull: {usersLiked: userId,usersDisliked: userId}
                }), {
                  new: true
                }
              )
              .then((sauceUpdated) =>
              sauceUpdated.links= hateoasLinks(req,sauce._id),
              res.status(200).json(sauceUpdated)) // Request ok
              .catch((error) => res.status(400).json({error})); // Error bad request
          } else if (usersLikedExists) {
            Sauce.findByIdAndUpdate({
                  _id: req.params.id
                },
                (toChange = {
                  $inc: {likes: -1}, // Remove a like
                  $pull: {usersLiked: userId} // Remove the user from the list of users liked
                }), {
                  new: true
                }
              )
              .then((sauceUpdated) =>
              sauceUpdated.links= hateoasLinks(req,sauce._id),
              res.status(200).json(sauceUpdated)) // Request ok
              .catch((error) => res.status(400).json({error})); // Error bad request
          } else if (usersDislikedExists) {
            Sauce.findByIdAndUpdate({
                  _id: req.params.id
                },
                (toChange = {
                  $inc: {dislikes: -1}, // Remove a dislike
                  $pull: {usersDisliked: userId} // Remove the user from the list of users disliked
                }), {
                  new: true
                }
              )
              .then((sauceUpdated) =>
              sauceUpdated.links= hateoasLinks(req,sauce._id),
              res.status(200).json(sauceUpdated)) // Request ok
              .catch((error) => res.status(400).json({error})); // Error bad request
          } else {
            res.status(200).json({message: "User's vote is already reset"});
          }
          break;
        case 1:
          toChange = {
            $inc: {likes: 1},
            $push: {usersLiked: userId}
          };
          if (usersDislikedExists) {
            toChange = {
              $inc: {dislikes: -1,likes: 1}, // Add a dislike and remove a like
              $pull: {usersDisliked: userId},
              $push: {usersLiked: userId}
            };
          }
          if (!usersLikedExists) {
            Sauce.findByIdAndUpdate({
                _id: req.params.id
              }, toChange, {
                new: true
              })
              .then((sauceUpdated) =>
              sauceUpdated.links= hateoasLinks(req,sauce._id),
              res.status(200).json(sauceUpdated)) // Request ok
              .catch((error) => res.status(400).json({error})); // Error bad request
          } else {
            res
              .status(200)
              .json({message: "User has already liked the sauce"});
          }
          break;
      }
    })
    .catch((error) => res.status(404).json({error})); // Error not found
};

/*****************************************************************
 *****************  HATEOAS FOR SAUCES    ************************
 *****************************************************************/
const hateoasLinks = (req, id) => {
  const URI = `${req.protocol}://${req.get("host") + "/api/sauces/"}`;
  return [
    {
      rel: "readSingle",
      title: "ReadSingle",
      href: URI + id,
      method: "GET",
    },
    {
      rel: "readAll",
      title: "readAll",
      href: URI,
      method: "GET",
    },
    {
      rel: "create",
      title: "Create",
      href: URI,
      method: "POST",
    },
    {
      rel: "likeOrDislike",
      title: "likeOrDislike",
      href: URI + id + "/like",
      method: "POST",
    },
    {
      rel: "modify",
      title: "modify",
      href: URI + id,
      method: "PUT",
    },
    {
      rel: "delete",
      title: "delete",
      href: URI + id,
      method: "DELETE",
    },
  ];
};
