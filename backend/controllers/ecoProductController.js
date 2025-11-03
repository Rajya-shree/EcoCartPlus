const asyncHandler = require('express-async-handler');
const EcoProduct = require('../models/ecoProductModel');

/**
 * @desc    Search for eco-products
 * @route   POST /api/eco-products/search
 * @access  Public
 */
const searchEcoProducts = asyncHandler(async (req, res) => {
  const { query } = req.body;

  let products;

  if (query) {
    // If there's a search query, use the text index
    products = await EcoProduct.find({ $text: { $search: query } });
  } else {
    // If the query is empty, just return all products
    products = await EcoProduct.find({});
  }

  // --- THIS IS YOUR CUSTOM "ECO-SCORE" LOGIC ---
  const productsWithScore = products.map((product) => {
    // Your formula: (Material * 0.5) + (Repair * 0.3) + (Company * 0.2)
    const finalScore =
      (product.materialScore * 5) +
      (product.repairabilityScore * 3) +
      (product.companyScore * 2);

    // We convert the Mongoose document to a plain object
    const productObject = product.toObject();

    return {
      ...productObject,
      finalEcoScore: finalScore, // Add the final score
    };
  });

  res.status(200).json(productsWithScore);
});

module.exports = {
  searchEcoProducts,
};