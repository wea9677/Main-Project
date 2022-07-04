const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const commentController = require("../controller/commentController");



//post
router.post("/:contentId", authMiddleware, commentController.writeComment);

// get
router.get("/:contentId", commentController.readComment);

// patch
router.patch("/:contentId/:commentId", authMiddleware, commentController.updateComment);

// delete
router.delete("/:contentId/:commentId", authMiddleware, commentController.deleteComment);
module.exports = router;