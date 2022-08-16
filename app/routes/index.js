const express = require("express");
const router = express.Router();
const userRoutes= require("./user");
const sauceRoutes= require("./sauce");

router.use("/auth", userRoutes); // Auth route
router.use("/sauces", sauceRoutes); // Sauce route
module.exports = router;
