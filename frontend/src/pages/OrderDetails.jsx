import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/useCart'
import { getOrder } from '../services/api'


const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    'https://shopkart-czew.onrender.com'
).replace(/\/$/, '');


const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(price)

function OrderDetails({ isConfirmation = false }) {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const navigate = useNavigate()
  const { clearCart } = useCart()

  useEffect(() => {
    let active = true
    getOrder(id)
      .then((result) => {
        if (active) setOrder(result)
      })
      .catch((errorObject) => {
        if (active) setError(errorObject.message || 'Unable to load this order.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [id, retry])

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
      setError(errorObject.message || 'Unable to log out. Try again.')
    }
  }

  return (
    <div className="customer-layout">
      <Navbar onLogout={handleLogout} />
      <main className="order-details-page">
        {loading && <p className="catalog-state" role="status">Loading order...</p>}
        {!loading && error && (
          <section className="catalog-state catalog-state--error" role="alert">
            <h2>Unable to load this order.</h2>
            <p>{error}</p>
            <button className="button button--outline" type="button" onClick={() => {
              setError('')
              setLoading(true)
              setRetry((count) => count + 1)
            }}>Try again</button>
          </section>
        )}
        {!loading && !error && order && (
          <article className="order-detail-card">
            {isConfirmation && order.paymentStatus === 'PAID' && (
              <div className="order-success" role="status">
                <span aria-hidden="true">✓</span>
                <h1>Order Placed Successfully</h1>
                <p>Your payment has been verified and your order is saved.</p>
              </div>
            )}
            <p className="auth-kicker">Order #{order._id}</p>
            {!isConfirmation && <h1 className="page-title">Order Details</h1>}
            <div className="order-summary__row"><span>Date</span><strong>{new Date(order.createdAt).toLocaleString('en-IN')}</strong></div>
            <div className="order-summary__row"><span>Status</span><strong>{order.status}</strong></div>
            <div className="order-summary__row"><span>Payment</span><strong>{order.paymentStatus}</strong></div>
            <h2>Items</h2>
            <ul className="order-card__items">
              {order.items.map((item, index) => (
                <li key={`${item.product}-${index}`}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </li>
              ))}
            </ul>
            <div className="order-summary__row"><span>Total</span><strong>{formatPrice(order.totalAmount)}</strong></div>
            <h2>Shipping Address</h2>
            <address className="order-address">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.addressLine1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />
              {order.shippingAddress.phone}
            </address>
            <div className="order-detail-actions">
              <Link className="button button--outline" to="/orders">View My Orders</Link>
              <Link className="button button--primary" to="/products">Continue Shopping</Link>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}

export default OrderDetails
