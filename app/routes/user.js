const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require('../middleware/auth');

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

router.get(`/`, auth,userCtrl.readUser);
router.get('/export', auth, userCtrl.exportUserData);
router.put('/', auth, userCtrl.updateUser);

module.exports = router;

