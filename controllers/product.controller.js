const mongoose = require("mongoose");
const Product = require("../models/product.model");

const createProduct = async (req, res) => {
    const { name, description, price, category, image, stock } = req.body;
    const requiredValues = [name, description, price, category, image, stock];

    if (requiredValues.some((value) => value === undefined || value === null || String(value).trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "All product fields are required"
        });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be a number greater than 0"
        });
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
            success: false,
            message: "Stock must be a number greater than or equal to 0"
        });
    }

    const product = await Product.create({
        name: String(name).trim(),
        description: String(description).trim(),
        price: parsedPrice,
        category: String(category).trim(),
        image: String(image).trim(),
        stock: parsedStock
    });

    return res.status(201).json({
        success: true,
        product
    });
};

const getProducts = async (req, res) => {
    const query = {};
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";

    if (search) {
        const escapedSearch = search.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.name = { $regex: escapedSearch, $options: "i" };
    }

    if (category) {
        query.category = category;
    }

    const sort = req.query.sort === "price_asc"
        ? { price: 1 }
        : req.query.sort === "price_desc"
            ? { price: -1 }
            : { createdAt: -1 };

    const projection = "name price category image stock";
    const [products, count] = await Promise.all([
        Product.find(query).select(projection).sort(sort).lean(),
        Product.countDocuments(query)
    ]);

    return res.status(200).json({
        success: true,
        count,
        products
    });
};

const getProductById = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    const product = await Product.findById(req.params.id).lean();

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    return res.status(200).json({
        success: true,
        product
    });
};

module.exports = { createProduct, getProducts, getProductById };