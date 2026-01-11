const asyncHandler = require("express-async-handler");
const EcoProduct = require("../models/ecoProductModel");

/**
 * @desc    Search for eco-products and calculate EcoScore locally
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
    // If the query is empty, return all products
    products = await EcoProduct.find({});
  }

  // --- LOCAL ML LOGIC: Weighted Scoring Algorithm ---
  // Formula from Research Paper:
  // EcoScore = (0.4 * Repairability) + (0.3 * EPEAT) + (0.3 * EnergyStar)
  const productsWithScore = products.map((product) => {
    // Ensure values exist or default to 0 to prevent crashes
    const repair = product.repairabilityScore || 0;
    const epeat = product.epeatRating || 0;
    const energyStar = product.energyStarRating || 0;

    // Apply your specific weighted algorithm
    const calculatedScore = 0.4 * repair + 0.3 * epeat + 0.3 * energyStar;

    // Convert Mongoose document to plain object and attach score
    return {
      ...product.toObject(),
      finalEcoScore: Math.round(calculatedScore * 10) / 10, // Round to 1 decimal
    };
  });

  res.status(200).json(productsWithScore);
});

module.exports = {
  searchEcoProducts,
};
