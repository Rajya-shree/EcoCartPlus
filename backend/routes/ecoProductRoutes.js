const express = require('express');
const router = express.Router();
const { searchEcoProducts } = require('../controllers/ecoProductController');

// This is a public route
// POST /api/eco-products/search
router.post('/search', searchEcoProducts);

module.exports = router;