const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
require("dotenv").config();

// encrypt the users mail

function encrypt(data){
   const encrypted = cryptoJS.AES.encrypt(
    data, 
    cryptoJS.enc.Utf8.parse(process.env.SECRET_KEY), 
    {
      iv: cryptoJS.enc.Utf8.parse(process.env.IV),
      mode: cryptoJS.mode.ECB,
      padding: cryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

// decrypt the users mail

function decrypt(data){
  console.log(data)
  const decrypted = cryptoJS.AES.decrypt(
    data, 
    cryptoJS.enc.Utf8.parse(process.env.SECRET_KEY), 
    {
      iv: cryptoJS.enc.Utf8.parse(process.env.IV),
      mode: cryptoJS.mode.ECB,
      padding: cryptoJS.pad.Pkcs7
  });
  console.log(decrypted)
  return decrypted.toString(cryptoJS.enc.Utf8)
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
      console.log(user.email)
      user
        .save()
        .then((newUser) =>{
          console.log(newUser.email)
          user.email= decrypt(newUser.email)
          res.status(201).json(newUser)
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) =>console.log(error));
};

// login user who's is already register
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "User not found !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Incorrect password !" });
          }
          res.status(200).json({
            userId: user._id,
            // creating a token for the session
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
