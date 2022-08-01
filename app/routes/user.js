const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require('../middleware/auth');

// Router post

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

// Router get

router.get('/', auth, userCtrl.readUser);
router.get('/export', auth, userCtrl.exportDataUser);

// Router put

router.put('/', auth, userCtrl.updateUser);

// Router delete

router.delete('/', auth, userCtrl.deleteUser);

module.exports = router;

