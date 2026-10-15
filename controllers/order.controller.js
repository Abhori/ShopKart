const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Order = require("../models/order.model");

const validateShippingAddress = (address) => {
    const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    if (!address || typeof address !== "object") {
        return "Shipping address is required";
    }

    for (const field of fields) {
        if (typeof address[field] !== "string" || !address[field].trim()) {
            return `${field} is required`;
        }
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
        return "Phone must be a valid 10-digit Indian mobile number";
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
        return "Pincode must contain 6 digits";
    }

    return null;
};

const getRazorpayConfig = () => {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        const error = new Error("Razorpay Test Mode credentials are not configured");
        error.status = 503;
        throw error;
    }
    if (!RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
        const error = new Error("Only Razorpay Test Mode credentials are accepted");
        error.status = 503;
        throw error;
    }
    return { keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET };
};

const createPaymentOrder = async (req, res) => {
    const shippingAddress = req.body?.shippingAddress;
    const validationError = validateShippingAddress(shippingAddress);
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const customer = await Customer.findById(req.user._id).populate({
        path: "cart.product",
        select: "name price image stock"
    });

    if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
    }
    if (!customer.cart.length) {
        return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    const items = [];
    let totalPaise = 0;

    for (const cartItem of customer.cart) {
        const product = cartItem.product;
        if (!product) {
            return res.status(400).json({
                success: false,
                message: "A product in your cart is no longer available"
            });
        }
        if (cartItem.quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.name}`
            });
        }

        const pricePaise = Math.round(product.price * 100);
        totalPaise += pricePaise * cartItem.quantity;
        items.push({
            product: product._id,
            name: product.name,
            price: pricePaise / 100,
            quantity: cartItem.quantity,
            image: product.image
        });
    }

    if (!Number.isSafeInteger(totalPaise) || totalPaise < 1) {
        return res.status(400).json({ success: false, message: "Order total is invalid" });
    }

    const { keyId, keySecret } = getRazorpayConfig();
    const order = await Order.create({
        user: customer._id,
        items,
        shippingAddress: {
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            addressLine1: shippingAddress.addressLine1.trim(),
            city: shippingAddress.city.trim(),
            state: shippingAddress.state.trim(),
            pincode: shippingAddress.pincode.trim()
        },
        totalAmount: totalPaise / 100,
        paymentStatus: "PENDING",
        status: "PENDING_PAYMENT"
    });

    try {
        const razorpayResponse = await axios.post(
            "https://api.razorpay.com/v1/orders",
            {
                amount: totalPaise,
                currency: "INR",
                receipt: order._id.toString()
            },
            {
                auth: { username: keyId, password: keySecret },
                timeout: 15000
            }
        );

        order.razorpayOrderId = razorpayResponse.data.id;
        await order.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: order.razorpayOrderId,
            amount: totalPaise,
            totalAmount: order.totalAmount,
            currency: "INR",
            key: keyId,
            items: order.items
        });
    } catch (error) {
        order.paymentStatus = "FAILED";
        await order.save();
        console.error("Razorpay order creation failed:", error.response?.data || error.message);
        return res.status(502).json({
            success: false,
            message: "Unable to start payment. Your cart has not been cleared."
        });
    }
};

const verifyPayment = async (req, res) => {
    const {
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
    } = req.body || {};

    if (!mongoose.isValidObjectId(shopKartOrderId)) {
        return res.status(400).json({ success: false, message: "Invalid ShopKart order ID" });
    }
    if (![razorpayOrderId, razorpayPaymentId, razorpaySignature].every(
        (value) => typeof value === "string" && value.length > 0
    )) {
        return res.status(400).json({ success: false, message: "Payment verification details are required" });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.paymentStatus === "PAID") {
        if (order.razorpayPaymentId === razorpayPaymentId) {
            return res.status(200).json({ success: true, order });
        }
        return res.status(409).json({ success: false, message: "Order has already been paid" });
    }
    if (!order.razorpayOrderId || razorpayOrderId !== order.razorpayOrderId) {
        return res.status(400).json({ success: false, message: "Payment order does not match" });
    }

    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
        .digest();
    const receivedSignature = Buffer.from(razorpaySignature, "hex");

    if (
        receivedSignature.length !== expectedSignature.length ||
        !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const updatedOrder = await Order.findOneAndUpdate(
                {
                    _id: order._id,
                    user: req.user._id,
                    paymentStatus: "PENDING",
                    razorpayOrderId: order.razorpayOrderId
                },
                {
                    $set: {
                        paymentStatus: "PAID",
                        status: "PLACED",
                        razorpayPaymentId
                    }
                },
                { new: true, session }
            );

            if (!updatedOrder) {
                const currentOrder = await Order.findById(order._id).session(session);
                if (currentOrder?.paymentStatus === "PAID" && currentOrder.razorpayPaymentId === razorpayPaymentId) {
                    return;
                }
                const conflict = new Error("Order is no longer awaiting payment");
                conflict.status = 409;
                throw conflict;
            }

            const customerUpdate = await Customer.updateOne(
                { _id: req.user._id },
                { $set: { cart: [] } },
                { session }
            );
            if (customerUpdate.matchedCount !== 1) {
                const missingCustomer = new Error("Customer not found");
                missingCustomer.status = 404;
                throw missingCustomer;
            }
        });
    } finally {
        await session.endSession();
    }

    const confirmedOrder = await Order.findOne({ _id: order._id, user: req.user._id });
    return res.status(200).json({ success: true, order: confirmedOrder });
};

const getOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
};

const getOrder = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, order });
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrder };
