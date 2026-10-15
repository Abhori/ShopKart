const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {
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

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    const productExists = customer.wishlist.some((item) => item.toString() === productId);

    if (productExists) {
        return res.status(409).json({
            success: false,
            message: "Product already in wishlist"
        });
    }

    customer.wishlist.push(product._id);
    await customer.save();

    return res.status(200).json({
        success: true,
        message: "Product added to wishlist"
    });
};

const getWishlist = async (req, res) => {
    const customer = await Customer.findById(req.user._id).populate({
        path: "wishlist",
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
        count: customer.wishlist.length,
        wishlist: customer.wishlist
    });
};

const removeFromWishlist = async (req, res) => {
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

    const productExists = customer.wishlist.some((item) => item.toString() === productId);

    if (!productExists) {
        return res.status(404).json({
            success: false,
            message: "Product not in wishlist"
        });
    }

    customer.wishlist = customer.wishlist.filter((item) => item.toString() !== productId);
    await customer.save();

    return res.status(200).json({
        success: true,
        message: "Product removed from wishlist"
    });
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
