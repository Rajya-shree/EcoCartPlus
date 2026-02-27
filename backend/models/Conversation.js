// const mongoose = require('mongoose');

// const ConversationSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   title: { type: String, required: true },
//   messages: [
//     {
//       role: { type: String, enum: ['user', 'model'], required: true },
//       content: { type: String, required: true },
//       timestamp: { type: String },
//       isStarred: { type: Boolean, default: false }
//     }
//   ],
//   lastUpdate: { type: Date, default: Date.now }
// }, { timestamps: true });

// module.exports = mongoose.model('Conversation', ConversationSchema);

const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  // 🟢 THIS IS THE KEY: Linking the conversation to a User ID
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Matches the name of your User model
    required: true 
  },
  title: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'model'], required: true },
      content: { type: String, required: true },
      timestamp: { type: String },
      isStarred: { type: Boolean, default: false }
    }
  ],
  lastUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);