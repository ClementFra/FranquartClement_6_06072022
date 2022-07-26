const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get("/:id", auth, sauceCtrl.readSingleSauce);
router.get("/", auth, sauceCtrl.readAllSauces);

router.post("/", auth, multer, sauceCtrl.createNewSauce);
router.post('/:id/like', auth, sauceCtrl.likeOrDislike);

router.put("/:id", auth, multer, sauceCtrl.modifySauce);

module.exports = router;