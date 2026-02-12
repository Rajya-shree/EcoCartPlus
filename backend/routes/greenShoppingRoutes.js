// const express = require("express");
// const router = express.Router();
// const { searchEcoProducts } = require("../controllers/ecoProductController");

// // This is a public route
// // POST /api/eco-products/search
// router.post("/search", searchEcoProducts);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { searchEcoProducts } = require('../controllers/greenShoppingController');

console.log("✅ ecoProductRoutes LOADED");

// POST /api/eco-products/search
router.post(
  "/search",
  (req, res, next) => {
    console.log("✅ /search HIT", req.body);
    next();
  },
  searchEcoProducts,
);

module.exports = router;
