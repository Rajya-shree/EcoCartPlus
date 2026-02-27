const Conversation = require("../models/Conversation");

// @desc    Save or Update a Vault Node
// @route   POST /api/repair/vault
// const saveToVault = async (req, res) => {
//   const { conversationId, messages, title } = req.body;

//   try {
//     if (conversationId) {
//       // Update existing
//       const updated = await Conversation.findOneAndUpdate(
//         { _id: conversationId, user: req.user._id },
//         { messages, lastUpdate: Date.now() },
//         { new: true },
//       );
//       return res.json(updated);
//     } else {
//       // Create new
//       const conversation = await Conversation.create({
//         user: req.user._id,
//         title: title || messages[1]?.content.slice(0, 30) + "...",
//         messages,
//       });
//       res.status(201).json(conversation);
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Vaulting failed", error: error.message });
//   }
// };

// @desc    Get single vaulted session by ID
// @route   GET /api/conversations/vault/:id
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id, // Critical: security check
    });

    if (conversation) {
      res.json(conversation);
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveToVault = async (req, res) => {
  const { conversationId, messages, title } = req.body;

  try {
    if (conversationId) {
      // 🟢 Update: Ensure the user ID matches so they can't edit someone else's chat
      const updated = await Conversation.findOneAndUpdate(
        { _id: conversationId, user: req.user._id },
        { messages, lastUpdate: Date.now() },
        { new: true },
      );
      return res.json(updated);
    } else {
      // 🟢 Create: Attach the logged-in user's ID to the new document
      const conversation = await Conversation.create({
        user: req.user._id,
        title: title || "New Investigation",
        messages,
      });
      res.status(201).json(conversation);
    }
  } catch (error) {
    res.status(500).json({ message: "Vaulting failed", error: error.message });
  }
};

// Add this function to GET the sessions for the Dashboard
const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id }).sort({
      // updatedAt: -1,
      updatedAt: -1,
    }); // Newest first
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // Critical security: ensures you only delete YOUR data
    });

    if (!conversation) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ message: "Node successfully purged from archives" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all vaulted sessions for a user
// @route   DELETE /api/conversations/vault/all
const clearAllUserConversations = async (req, res) => {
  try {
    // 🟢 Deletes every document where the 'user' field matches req.user._id
    const result = await Conversation.deleteMany({ user: req.user._id });

    res.json({
      message: "All nodes successfully purged",
      count: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update module.exports
module.exports = {
  saveToVault,
  getUserConversations,
  getConversationById,
  deleteConversation,
  clearAllUserConversations, // 🟢 Add this
};
