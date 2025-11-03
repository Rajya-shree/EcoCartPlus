const mongoose = require('mongoose');

const ecoProductSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String }, // Using String for "₹499"
    buyLink: { type: String },
    imageUrl: { type: String },
    features: [String], // An array of text features
    
    // YOUR RAW SCORE DATA
    materialScore: { type: Number, required: true, min: 1, max: 10 },
    repairabilityScore: { type: Number, required: true, min: 1, max: 10 },
    companyScore: { type: Number, required: true, min: 1, max: 10 },

    // YOUR SUSTAINABILITY NOTES
    ecoReasons: [String], // An array of text notes
  },
  {
    timestamps: true,
  }
);

// This creates a "text index" so we can search the 'name' field
ecoProductSchema.index({ name: 'text' });

module.exports = mongoose.model('EcoProduct', ecoProductSchema);