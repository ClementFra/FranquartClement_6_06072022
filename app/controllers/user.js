const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
require("dotenv").config();

// Encrypt the users mail

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

// Decrypt the users mail

function decrypt(data) {
  console.log(data);
  const decrypted = cryptoJS.AES.decrypt(
    data,
    cryptoJS.enc.Utf8.parse(process.env.SECRET_KEY),
    {
      iv: cryptoJS.enc.Utf8.parse(process.env.IV),
      mode: cryptoJS.mode.ECB,
      padding: cryptoJS.pad.Pkcs7,
    }
  );
  console.log(decrypted);
  return decrypted.toString(cryptoJS.enc.Utf8);
}

// Register for a new user
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: encrypt(req.body.email),
        password: hash,
      });
      console.log(user.email);
      user
        .save()
        .then((newUser) => {
          console.log(newUser.email);
          user.email = decrypt(newUser.email);
          res.status(201).json(newUser);
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => console.log(error));
};

// Login user who's is already register
exports.login = (req, res, next) => {
  const encryptedEmail = encrypt(req.body.email);
  User.findOne({ email: encryptedEmail })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "User not found !" });
      }
      user.email = decrypt(user.email);
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Incorrect password !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
            user: user,
          });
          hateoasLinks(req, user._id);
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/** RGDP*/

// Read users

exports.readUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          message: "User not found!",
        });
      } else {
        user.email = decrypt(user.email);
        res.status(200).json(user, hateoasLinks(req, user._id));
      }
    })
    .catch((error) =>
      res.status(404).json({
        error,
      })
    );
};

// Export data user

exports.exportDataUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          message: "User not found!",
        });
      } else {
        user.email = decrypt(user.email);
        const userText = user.toString();
        res.attachment("user-data.txt");
        res.type("txt");
        return res.status(200).send(userText);
      }
    })
    .catch((error) =>
      res.status(500).json({
        error,
      })
    );
};

// Update user

exports.updateUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(401).json({
          message: "User not found!" ,
        });
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
            res
              .status(200)
              .json(updateUser, hateoasLinks(req, updateUser._id));
          })
          .catch((error) => {
            res.status(400).json({
              error: error,
            });
          });
      }
    })
    .catch((error) =>
      res.status(500).json({
        error,
      })
    );
};

// Delete user

exports.deleteUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          message: "User not found!",
        });
      } else {
        User.deleteOne({
          _id: req.auth.userId,
        })
          .then(() => {
            res.status(204).json(user);
          })
          .catch((error) => {
            res.status(400).json({
              error: error,
            });
          });
      }
    })
    .catch((error) =>
      res.status(404).json({
        error,
      })
    );
};
// Create hateoas links

const hateoasLinks = (req) => {
  const URI = `${req.protocol}://${req.get("host") + "/api/auth/"}`;
  return [
    {
      rel: "signup",
      title: "Signup",
      href: URI + "signup",
      method: "POST",
    },
    {
      rel: "login",
      title: "Login",
      href: URI + "login",
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
      title: "Delete",
      href: URI,
      method: "DELETE",
    },
  ];
};
