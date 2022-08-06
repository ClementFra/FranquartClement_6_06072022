const jwt = require("jsonwebtoken");

// Control the authorization of connection for the user

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
    if (req.body.userId && req.body.userId !== userId) {
      res.status(403).json({ error: "User ID invalid" });
    } else {
      next();
    }
  } catch {
    res.status(403).json({ error: "Unauthorized request." });
  }
};
