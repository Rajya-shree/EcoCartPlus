const express = require('express');
const router = express.Router();
// 1. Import the new function
const {
  getRepairGuides,
  getRepairScore,
} = require('../controllers/ifixitController');

// This is a public route for guides
// POST /api/repair-guides
router.post('/', getRepairGuides);

// 2. Add the new public route for scores
// POST /api/repair-guides/score
router.post('/score', getRepairScore);

module.exports = router;