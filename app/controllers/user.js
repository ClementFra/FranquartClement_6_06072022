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
          newUser.email = decrypt(newUser.email);
          res.status(201).json(hateoasLinks(req, newUser, newUser._id)); // Create the user
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
          const userSend = hateoasLinks(req, user._id);
          res.status(200).json({
            // Request ok
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
            userSend,
          });
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
        res.status(404).json({ message: "User not found!" }); // Error not found
      } else {
        user.email = decrypt(user.email);
        res.status(200).json(hateoasLinks(req, user)); // Request ok
      }
    })
    .catch(
      (error) => res.status(500).json({ error }) // Internal Error Server
    );
};

/*****************************************************************
 *****************  EXPORT THE USER DATA     *********************
 *****************************************************************/
exports.exportUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        // Error if user was not found
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
    .catch(
      (error) => res.status(500).json({ error }) // Internal Error Server
    );
};

/*****************************************************************
 *****************  UPDATE THE USER SETUP    *********************
 *****************************************************************/
exports.updateUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then(async (user) => {
      if (!user) {
        res.status(404).json({ message: "user not found" }); // Error not found
      } else {
        const update = {};
        if (req.body.email) {
          update.email = encrypt(req.body.email);
        }
        if (req.body.password) {
          const hash = await bcrypt.hash(req.body.password, 10);
          update.password = hash;
        }
        // Update user new info in database
        User.findByIdAndUpdate({ _id: req.auth.userId }, update).then(
          (userUpdate) => {
            userUpdate.email = decrypt(userUpdate.email);
            res.status(200).json(hateoasLinks(req, userUpdate, userUpdate._id)); // Request ok
          }
        );
      }
    })
    .catch((error) => res.status(500).json(error)); // Internal Error Server
};
/*****************************************************************
 *****************     DELETE THE USER       *********************
 *****************************************************************/
exports.deleteUser = (req, res, next) => {
  User.findById(req.auth.userId) // Find user and delete
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User not found!" }); // Error not found
      } else {
        User.deleteOne({
          _id: req.auth.userId,
        })
          .then(() => {
            res.status(204).send();
          })
          .catch((error) => {
            res.status(400).json({ error });
          });
      }
    })
    .catch(
      (error) => res.status(500).json({ error }) // Internal Error Server
    );
};

/*****************************************************************
 *****************    HATEOAS FOR USERS     **********************
 *****************************************************************/
const hateoasLinks = (req, user) => {
  const URI = `${req.protocol}://${req.get("host") + "/api/auth/"}`;

  const hateoas = [
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
      title: "Delete",
      href: URI,
      method: "DELETE",
    },
  ];
  return {
    ...user.doc,
    links: hateoas,
  };
};
