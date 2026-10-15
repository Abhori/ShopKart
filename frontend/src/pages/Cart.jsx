import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import CartItem from '../components/CartItem'
import Navbar from '../components/Navbar'
import { useCart } from '../context/useCart'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(price)

function Cart() {
  const navigate = useNavigate()
  const [actionError, setActionError] = useState('')
  const { cartItems, loading, error, subtotal, cartCount, pendingActionIds, updateQuantity, removeFromCart, refreshCart, clearCart } = useCart()

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error('Unable to log out. Try again.')
      clearCart()
      navigate('/login')
    } catch (errorObject) {
      setActionError(errorObject.message || 'Unable to log out. Try again.')
    }
  }

  const handleIncrement = async (productId) => {
    const item = cartItems.find((entry) => entry.product?._id === productId)
    if (!item) return

    try {
      setActionError('')
      await updateQuantity(productId, item.quantity + 1)
    } catch (errorObject) {
      setActionError(errorObject.message || 'Unable to update quantity.')
    }
  }

  const handleDecrement = async (productId) => {
    const item = cartItems.find((entry) => entry.product?._id === productId)
    if (!item || item.quantity <= 1) return

    try {
      setActionError('')
      await updateQuantity(productId, item.quantity - 1)
    } catch (errorObject) {
      setActionError(errorObject.message || 'Unable to update quantity.')
    }
  }

  const handleRemove = async (productId) => {
    try {
      setActionError('')
      await removeFromCart(productId)
    } catch (errorObject) {
      setActionError(errorObject.message || 'Unable to remove product from cart.')
    }
  }

  return (
    <div className="customer-layout">
      <Navbar onLogout={handleLogout} />
      <main className="cart-page">
        <div className="cart-page__header">
          <div>
            <p className="auth-kicker">Your basket</p>
            <h1 className="page-title">My Cart</h1>
          </div>
          {!loading && !error && <p className="catalog-count">{cartCount} item{cartCount === 1 ? '' : 's'}</p>}
        </div>

        {loading && <p className="catalog-state" role="status">Loading your cart...</p>}

        {!loading && error && (
          <section className="catalog-state catalog-state--error" role="alert">
            <h2>Unable to load your cart.</h2>
            <p>{error}</p>
            <button className="button button--outline" type="button" onClick={() => refreshCart()}>
              Try again
            </button>
          </section>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <section className="catalog-state cart-empty" aria-live="polite">
            <h2>Your cart is empty 🛒</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button className="button button--primary" type="button" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </section>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <section className="cart-layout">
            <div className="cart-items">
              {actionError && <p className="error-message" role="alert">{actionError}</p>}
              {cartItems.map((item) => (
                <CartItem
                  key={item.product?._id}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                  isUpdating={pendingActionIds.includes(item.product?._id)}
                />
              ))}
            </div>

            <aside className="order-summary">
              <h2>Order Summary</h2>
              <div className="order-summary__row">
                <span>Items</span>
                <strong>{cartCount}</strong>
              </div>
              <div className="order-summary__row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <button className="button button--primary order-summary__button" type="button" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </aside>
          </section>
        )}
      </main>
    </div>
  )
}

export default Cart
