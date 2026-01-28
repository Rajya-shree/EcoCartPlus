const asyncHandler = require("express-async-handler");
const EcoProduct = require("../models/ecoProductModel");
const { evaluateProductSustainability } = require("../services/aiService");

// const searchEcoProducts = asyncHandler(async (req, res) => {
//   const { query } = req.body;

//   // 1. If no query, return the default items from MongoDB
//   if (!query || query.trim() === "") {
//     const products = await EcoProduct.find({});
//     const productsWithScore = products.map((p) => ({
//       ...p.toObject(),
//       finalEcoScore:
//         p.materialScore * 5 + p.repairabilityScore * 3 + p.companyScore * 2,
//     }));
//     return res.status(200).json(productsWithScore);
//   }

//   // 2. If user searched, use AI to get data from the internet
//   const aiData = await evaluateProductSustainability(query);
//   if (aiData) {
//     // Apply your project's weighted score formula
//     const finalScore =
//       aiData.materialScore * 5 +
//       aiData.repairabilityScore * 3 +
//       aiData.companyScore * 2;
//     res.status(200).json([{ ...aiData, finalEcoScore: finalScore }]);
//   } else {
//     res.status(500);
//     throw new Error("AI Assistant failed to find product data.");
//   }
// });
const searchEcoProducts = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === "") {
    const products = await EcoProduct.find({});

    const productsWithScore = products.map((p) => {
      const productObj = p.toObject();
      // Ensure we use numbers and your formula: (M*5 + R*3 + C*2)
      const m = Number(productObj.materialScore) || 0;
      const r = Number(productObj.repairabilityScore) || 0;
      const c = Number(productObj.companyScore) || 0;

      return {
        ...productObj,
        finalEcoScore: m * 5 + r * 3 + c * 2,
      };
    });

    return res.status(200).json(productsWithScore);
  }

  // ... (AI search logic)
  // 2. AI Research Logic (Takes 3-10 seconds)
  console.log(`🔍 AI is researching: ${query}...`);
  const aiData = await evaluateProductSustainability(query);

  if (aiData) {
    // Return AI data if successful
    const finalScore =
      aiData.materialScore * 5 +
      aiData.repairabilityScore * 3 +
      aiData.companyScore * 2;
    res.status(200).json([{ ...aiData, finalEcoScore: finalScore }]);
  } else {
    // 🟢 FALLBACK: If AI fails, search MongoDB instead of crashing
    const localProducts = await EcoProduct.find({
      name: { $regex: query, $options: "i" },
    });

    if (localProducts.length > 0) {
      const productsWithScore = localProducts.map((p) => ({
        ...p.toObject(),
        finalEcoScore:
          p.materialScore * 5 + p.repairabilityScore * 3 + p.companyScore * 2,
      }));
      res.status(200).json(productsWithScore);
    } else {
      res.status(404).json({
        message: "Product not found in database and AI search failed.",
      });
    }
  }
});

module.exports = { searchEcoProducts };
