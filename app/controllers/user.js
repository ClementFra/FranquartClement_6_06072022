const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
require("dotenv").config();

/*****************************************************************
 *****************  ENCRYPT THE USER EMAIL   *********************
 *****************************************************************/
function encrypt(data) {
  const encrypted = cryptoJS.AES.encrypt(
    data,
    cryptoJS.enc.Utf8.parse(process.env.SECRET_KEY),
    {
      iv: cryptoJS.enc.Utf8.parse(process.env.IV),
      mode: cryptoJS.mode.ECB,
      padding: cryptoJS.pad.Pkcs7,
    }
  );
  return encrypted.toString();
}

/*****************************************************************
 *****************  DECRYPT THE USER EMAIL   *********************
 *****************************************************************/
function decrypt(data) {
  const decrypted = cryptoJS.AES.decrypt(
    data,
    cryptoJS.enc.Utf8.parse(process.env.SECRET_KEY),
    {
      iv: cryptoJS.enc.Utf8.parse(process.env.IV),
      mode: cryptoJS.mode.ECB,
      padding: cryptoJS.pad.Pkcs7,
    }
  );
  return decrypted.toString(cryptoJS.enc.Utf8);
}

/*****************************************************************
 *****************     USER SIGNIN           *********************
 *****************************************************************/
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // Hash the password
    .then((hash) => {
      const user = new User({
        email: encrypt(req.body.email), // EncrypString the email
        password: hash,
      });
      console.log(user.email);
      user
        .save() // Save the user
        .then((newUser) => {
          console.log(newUser.email);
          user.email = decrypt(newUser.email);
          newUser.links= hateoasLinks(req,newUser._id);
          res.status(201).json(newUser); // Create the user
        })
        .catch((error) => res.status(400).json({ error })); // Error bad request
    })
    .catch((error) => res.status(500).json({ error })); // Internal Error Server
};

/*****************************************************************
 *****************     USER LOGING           *********************
 *****************************************************************/
exports.login = (req, res, next) => {
  const encryptedEmail = encrypt(req.body.email);
  User.findOne({ email: encryptedEmail })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "User not found !" }); // Error not found
      }
      user.email = decrypt(user.email);
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Incorrect password !" }); // Error Unauthorized
          }
          res.status(200).json({ // Request ok
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
            user: user,
          });
          hateoasLinks(req, user._id);
        })
        .catch((error) => res.status(500).json({ error })); // Internal Error Server
    })
    .catch((error) => res.status(500).json({ error })); // Internal Error Server
};

/*****************************************************************
 *****************       READ THE USER       *********************
 *****************************************************************/
exports.readUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          message: "User not found!", // Error not found
        });
      } else {
        user.email = decrypt(user.email);
        user.links = hateoasLinks(req, user._id);
        res.status(200).json(user); // Request ok
      }
    })
    .catch((error) =>console.log(error));
};

/*****************************************************************
 *****************  EXPORT THE USER DATA     *********************
 *****************************************************************/
exports.exportDataUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) { // Error if user was not found
        res.status(404).json({
          message: "User not found!", // Error not found
        });
      } else {
        user.email = decrypt(user.email);
        const userText = user.toString();
        res.attachment("user-data.txt");
        res.type("txt");
        return res.status(200).send(userText); // Request ok
      }
    })
    .catch((error) =>
      res.status(500).json({error}) // Internal Error Server
    );
};

/*****************************************************************
 *****************  UPDATE THE USER SETUP    *********************
 *****************************************************************/
exports.updateUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          message: "User not found!"}); // Error not found
      } else {
        User.findByIdAndUpdate(
          {
            _id: req.auth.userId,
          },
          {
            ...req.body,
            email: encrypt(req.body.email),
          },
          {
            new: true,
          }
        )
          .then((updateUser) => {
            updateUser.email = decrypt(updateUser.email);
            updateUser.links = hateoasLinks(req, updateUser._id);
            res.status(200).json(updateUser);
          })
          .catch((error) => {
            res.status(400).json({error});
          });
      }
    })
    .catch((error) =>
      res.status(500).json({error}) // Internal Error Server
    );
};

/*****************************************************************
 *****************     DELETE THE USER       *********************
 *****************************************************************/
exports.deleteUser = (req, res, next) => {
  User.findById(req.auth.userId) // Find user and delete
    .then((user) => {
      if (!user) {
        res.status(404).json({
          message: "User not found!"}); // Error not found
      } else {
        User.deleteOne({
          _id: req.auth.userId,
        })
          .then(() => {
            res.status(204).json(user); 
          })
          .catch((error) => {
            res.status(400).json({error});
          });
      }
    })
    .catch((error) =>
      res.status(500).json({error}) // Internal Error Server
    );
};

/*****************************************************************
 *****************    HATEOAS FOR USERS     **********************
 *****************************************************************/
const hateoasLinks = (req, id ) => {
  const URI = `${req.protocol}://${req.get("host") + "/api/auth/"}`;
  return [
    {
      rel: "signup",
      title: "Signup",
      href: URI + "/signup",
      method: "POST",
    },
    {
      rel: "login",
      title: "Login",
      href: URI + "/login",
      method: "POST",
    },
    {
      rel: "read",
      title: "Read",
      href: URI,
      method: "GET",
    },
    {
      rel: "export",
      title: "Export",
      href: URI + "export",
      method: "GET",
    },
    {
      rel: "update",
      title: "Update",
      href: URI,
      method: "PUT",
    },
    {
      rel: "delete",
      title: "Delete"+ id,
      href: URI,
      method: "DELETE",
    },
  ];
};
