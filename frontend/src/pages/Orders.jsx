import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/useCart'
import { getOrders } from '../services/api'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(price)

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const navigate = useNavigate()
  const { clearCart } = useCart()

  useEffect(() => {
    let active = true
    getOrders()
      .then((result) => {
        if (active) setOrders(result)
      })
      .catch((errorObject) => {
        if (active) setError(errorObject.message || 'Unable to load your orders.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [retry])

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
      <main className="orders-page">
        <p className="auth-kicker">Your ShopKart history</p>
        <h1 className="page-title">My Orders</h1>
        {loading && <p className="catalog-state" role="status">Loading your orders...</p>}
        {!loading && error && (
          <section className="catalog-state catalog-state--error" role="alert">
            <h2>Unable to load your orders.</h2>
            <p>{error}</p>
            <button className="button button--outline" type="button" onClick={() => {
              setError('')
              setLoading(true)
              setRetry((count) => count + 1)
            }}>Try again</button>
          </section>
        )}
        {!loading && !error && orders.length === 0 && (
          <section className="catalog-state cart-empty">
            <h2>You have not placed any orders yet.</h2>
            <button className="button button--primary" type="button" onClick={() => navigate('/products')}>
              Start Shopping
            </button>
          </section>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card__header">
                  <div>
                    <h2>Order #{order._id}</h2>
                    <p>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</p>
                  </div>
                  <span className={`order-status order-status--${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus === 'FAILED'
                      ? 'PAYMENT FAILED'
                      : order.status === 'PENDING_PAYMENT'
                        ? 'PAYMENT PENDING'
                        : order.status}
                  </span>
                </div>
                <ul className="order-card__items">
                  {order.items.map((item, index) => (
                    <li key={`${item.product}-${index}`}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
                <div className="order-card__footer">
                  <strong>Total: {formatPrice(order.totalAmount)}</strong>
                  <Link className="button button--outline" to={`/orders/${order._id}`}>View Details</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Orders
