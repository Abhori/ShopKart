# Razorpay Test Mode setup

1. Copy `.env.example` to `.env` in the project root and keep `.env` private.
2. Add your MongoDB connection string and JWT secret.
3. Create Razorpay **Test Mode** API keys in the Razorpay dashboard. Put the test Key ID and Key Secret in `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The backend rejects non-test Key IDs.
4. Start the backend and frontend, log in, add an in-stock product, and proceed from the cart to checkout.
5. Use Razorpay's test payment options. The cart is cleared only after `/orders/verify-payment` confirms the Razorpay signature.

The Razorpay Key Secret is used only by the backend. Never add it to a `VITE_*` variable or frontend source.
