const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); // Multer configurations

// Router get

router.get("/:id", auth, sauceCtrl.readSauce); // Read sauce
router.get("/", auth, sauceCtrl.readAllSauces); // Read all sauces

// Router post

router.post("/", auth, multer, sauceCtrl.createSauce); // create sauce
router.post('/:id/like', auth, sauceCtrl.likeOrDislike); // Like or dislike sauce

// Router put
router.put("/:id", auth, multer, sauceCtrl.updateSauce); // Update sauce

// Router delete
router.delete("/:id", auth, sauceCtrl.deleteSauce); // Delete sauce

module.exports = router;