const express = require("express");
const router = express.Router();
const { getRepairShops } = require("../controllers/repairShopController");

// This is a public route
// GET /api/repair-shops
router.route("/").get(getRepairShops);

module.exports = router;
