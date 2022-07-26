const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Router get

router.get("/:id", auth, sauceCtrl.readSingleSauce);
router.get("/", auth, sauceCtrl.readAllSauces);

// Router post

router.post("/", auth, multer, sauceCtrl.createNewSauce);
router.post('/:id/like', auth, sauceCtrl.likeOrDislike);

// Router put
router.put("/:id", auth, multer, sauceCtrl.modifySauce);

// Router delete
router.delete("/:id", auth, sauceCtrl.deleteSauce);

module.exports = router;