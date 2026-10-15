const jwt = require("jsonwebtoken");

const Customer = require("../models/customer.model");

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Not authorized"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized"
        });
    }

    try {
        const customer = await Customer.findById(decoded.customerId);

        if (!customer) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        req.user = customer;
        return next();
    } catch (error) {
        console.error("Authentication lookup failed:", error.message);
        return res.status(500).json({
            message: "Unable to authenticate request"
        });
    }
};

module.exports = authMiddleware;