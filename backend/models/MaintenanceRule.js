const mongoose = require('mongoose');

const maintenanceRuleSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Software Update', 'Maintenance', 'Hardware Check'], default: 'Maintenance' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    
    // The "Dynamic" Triggers
    targetCategory: { type: String }, // e.g., "smartphone", "laptop" (leave null for all)
    targetBrand: { type: String },    // e.g., "Samsung", "Apple" (leave null for all)
    targetModel: { type: String },    // e.g., "A35 5G" (leave null for all models of the brand)
    
    frequencyDays: { type: Number, default: 0 }, // e.g., 30 for monthly. 0 means it's a one-time trigger (like a software update)
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceRule', maintenanceRuleSchema);