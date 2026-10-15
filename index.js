require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();

const cors = require("cors");

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://shop-kart-xi-three.vercel.app"
    ],
    credentials: true
}));




app.use(express.json());
app.use(cookieParser());

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
    res.send("Shopkart Backend Running");
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const isDuplicateEmail = error.code === 11000;
  const status = isDuplicateEmail ? 409 : (error.status || 500);
  const message = isDuplicateEmail
    ? "Email already registered"
    : status < 500
      ? error.message
      : "Internal server error";

  console.error("Request error:", error.message);
  return res.status(status).json({
    success: false,
    message
  });
});


const startServer = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MongoDB connection error: MONGO_URI is missing from .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

startServer();