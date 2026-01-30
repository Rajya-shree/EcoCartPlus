// const express = require("express");
// const router = express.Router();

// const { handleRepairQuery } = require("../controllers/aiController");
// const { protect } = require("../middleware/authMiddleware");

// router.post("/analyze", protect, handleRepairQuery);

// module.exports = router;

const express = require("express");
const router = express.Router();
// IMPORTANT: Import the SEARCH function from the ECO controller
const { searchEcoProducts } = require("../controllers/ecoProductController");
const { diagnoseDevice } = require("../controllers/aiController");

// Use 'searchEcoProducts' as the handler.
// If this is undefined, the server will crash with that TypeError.
router.post("/analyze", searchEcoProducts);
router.post("/diagnose", diagnoseDevice);

module.exports = router;
