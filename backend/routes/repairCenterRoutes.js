const express = require('express');
const router = express.Router();
const { getRepairCenters } = require('../controllers/repairCenterController');

// GET /api/repair-centers
router.route('/').get(getRepairCenters);

module.exports = router;