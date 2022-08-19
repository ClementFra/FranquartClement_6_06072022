const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require('../middleware/auth');
const pswd = require("../middleware/password");
const rateLter = require("../middleware/rate-limiter");


// Router post

router.post("/signup",pswd, userCtrl.signup);
router.post("/login",rateLter, userCtrl.login);

// Router get

router.get('/', auth, userCtrl.readUser);
router.get('/export', auth, userCtrl.exportUser);

// Router put

router.put('/', auth, userCtrl.updateUser);

// Router delete

router.delete('/', auth, userCtrl.deleteUser);

module.exports = router;

