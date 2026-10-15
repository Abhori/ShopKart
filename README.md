# ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce application built with React, Node.js, Express, and MongoDB. It includes product browsing, customer authentication, a shopping cart, wishlist management, order management, and Razorpay payment integration.

## Tech Stack

**Frontend**
- React
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB and Mongoose
- JWT authentication
- Razorpay payment integration

## Features

- Customer registration and login
- Product catalog and search
- Shopping cart
- Wishlist management
- Order creation and order history
- Razorpay payment integration
- Protected backend routes

## Project Structure

```text
ShopKart/
├── controllers/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── README.md
├── middlewares/
├── models/
├── routes/
├── utils/
├── index.js
├── package.json
├── package-lock.json
├── .env.example
└── PAYMENT_SETUP.md
```

## Prerequisites

- Node.js and npm
- MongoDB database
- Git

Razorpay test credentials are required to test the payment flow.

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Abhori/ShopKart.git
cd ShopKart
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a reference.

Configure the variables required by the application:

- `MONGO_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Use your own credentials. Never commit `.env` or publish secret keys.

### 4. Start the backend

```bash
node index.js
```

Check the backend startup messages and ensure the database connection succeeds.

### 5. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Payment Setup

Refer to [PAYMENT_SETUP.md](PAYMENT_SETUP.md) for payment configuration and testing instructions. Use Razorpay test mode and test credentials.

## Security

- Keep environment variables and secrets private.
- Do not commit `.env` files.
- Use test credentials when testing payments.
- Configure database access and application settings appropriately before deployment.

## Author

Abhori Maity