const bcrypt = require("bcrypt");

const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

const registerCustomer = async (req, res) => {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }
    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
        return res.status(409).json({
            message: "Email already registered"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 


    const customer = await Customer.create({
        fullName,
        email,
        password: hashedPassword,
        phone 
    });

    const customerResponse = {
    success: true,
    message: "Customer registered successfully",
    customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
    }
}

    return res.status(201).json(customerResponse);
};

const loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(
        password, 
        customer.password
    );

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const token = generateToken(customer._id);

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
});

    return res.status(200).json({
    success: true,
    message: "Login successful",
    customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
    }
});
};

const getMyProfile = async (req, res) => {
    const customer = req.user;

    return res.status(200).json({
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
    });
};

const logoutCustomer = (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        path: "/"
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

module.exports = { registerCustomer, loginCustomer, getMyProfile, logoutCustomer };