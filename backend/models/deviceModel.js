const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema(
  {
    // This connects the device to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This tells Mongoose to link to the 'User' model
    },
    // Your 'name' field
    deviceName: {
      type: String,
      required: [true, 'Please add a device name'],
    },
    // This is from your plan
    purchaseDate: {
      type: Date,
    },
    // We can add other fields from your plan
    deviceModel: {
      type: String,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Device', deviceSchema);