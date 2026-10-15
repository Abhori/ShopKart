const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToCart = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    if (product.stock < 1) {
        return res.status(400).json({
            success: false,
            message: "Product is out of stock"
        });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    const cartItem = customer.cart.find((item) => item.product.toString() === productId);

    if (cartItem) {
        const nextQuantity = cartItem.quantity + 1;

        if (nextQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        cartItem.quantity = nextQuantity;
    } else {
        customer.cart.push({
            product: product._id,
            quantity: 1
        });
    }

    await customer.save();

    const populatedCustomer = await Customer.findById(req.user._id).populate({
        path: "cart.product",
        select: "name price category image stock"
    });

    return res.status(200).json({
        success: true,
        message: "Cart updated",
        cart: populatedCustomer.cart
    });
};

const getCart = async (req, res) => {
    const customer = await Customer.findById(req.user._id).populate({
        path: "cart.product",
        select: "name price category image stock"
    });

    if (!customer) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    return res.status(200).json({
        success: true,
        cart: customer.cart.map((item) => ({
            product: item.product,
            quantity: item.quantity
        }))
    });
};

const updateCartItemQuantity = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a positive integer"
        });
    }

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    const cartItem = customer.cart.find((item) => item.product.toString() === productId);

    if (!cartItem) {
        return res.status(404).json({
            success: false,
            message: "Product not in cart"
        });
    }

    if (quantity > product.stock) {
        return res.status(400).json({
            success: false,
            message: "Requested quantity exceeds available stock"
        });
    }

    cartItem.quantity = quantity;
    await customer.save();

    const populatedCustomer = await Customer.findById(req.user._id).populate({
        path: "cart.product",
        select: "name price category image stock"
    });

    return res.status(200).json({
        success: true,
        message: "Cart updated",
        cart: populatedCustomer.cart
    });
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    const existingItem = customer.cart.find((item) => item.product.toString() === productId);

    if (!existingItem) {
        return res.status(404).json({
            success: false,
            message: "Product not in cart"
        });
    }

    customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
    await customer.save();

    const populatedCustomer = await Customer.findById(req.user._id).populate({
        path: "cart.product",
        select: "name price category image stock"
    });

    return res.status(200).json({
        success: true,
        message: "Product removed from cart",
        cart: populatedCustomer.cart
    });
};

module.exports = {
    addToCart,
    getCart,
    updateCartItemQuantity,
    removeFromCart
};
