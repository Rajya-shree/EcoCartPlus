// const express = require("express");
// const router = express.Router();

// // 🟢 Change this line to point to ConversationController
// const { saveToVault } = require("../controllers/ConversationController");
// const { protect } = require("../middleware/authMiddleware");

// // This results in: POST /api/conversations/vault
// router.post("/vault", protect, saveToVault);

// router.post("/vault", protect, saveToVault);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  saveToVault,
  getUserConversations,
  getConversationById,
  deleteConversation,
  clearAllUserConversations,
} = require("../controllers/ConversationController");
const { protect } = require("../middleware/authMiddleware");

// 🟢 GET List for Dashboard: /api/conversations/vault
router.get("/vault", protect, getUserConversations);

// 🟢 GET Specific Session: /api/conversations/vault/:id
router.get("/vault/:id", protect, getConversationById);

// 🟢 POST Save/Update: /api/conversations/vault
router.post("/vault", protect, saveToVault);

router.delete("/vault/:id", protect, deleteConversation); // For purging from Archives

// 🟢 Add this ABOVE router.delete("/vault/:id", ...)
router.delete("/vault/all", protect, clearAllUserConversations);

module.exports = router;
