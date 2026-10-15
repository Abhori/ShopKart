const express = require("express");

const { addToWishlist, getWishlist, removeFromWishlist } = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/:productId", authMiddleware, addToWishlist);
router.get("/", authMiddleware, getWishlist);
router.delete("/:productId", authMiddleware, removeFromWishlist);

module.exports = router;
