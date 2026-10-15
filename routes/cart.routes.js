const express = require("express");

const {
    addToCart,
    getCart,
    updateCartItemQuantity,
    removeFromCart
} = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/:productId", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/:productId", authMiddleware, updateCartItemQuantity);
router.delete("/:productId", authMiddleware, removeFromCart);

module.exports = router;
