const jwt = require('jsonwebtoken');

// Control the authorization of connection for the user
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
       if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid ID';
      }
	next();
   } catch{
       res.status(403).json({ error: new Error(`Unauthorized request.`) });
   }
};