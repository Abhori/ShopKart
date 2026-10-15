import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/useCart'
import { createPaymentOrder, verifyPayment } from '../services/api'

const initialAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: ''
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(price)

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, loading, error, subtotal, clearCart, refreshCart } = useCart()
  const [address, setAddress] = useState(initialAddress)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSummary, setPaymentSummary] = useState(null)

  const updateAddress = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
  }

  const validateAddress = () => {
    const labels = {
      fullName: 'Full name',
      phone: 'Phone',
      addressLine1: 'Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode'
    }
    const missing = Object.entries(address).find(([, value]) => !value.trim())

    if (missing) return `${labels[missing[0]]} is required.`
    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      return 'Enter a valid 10-digit Indian mobile number.'
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      return 'Pincode must contain 6 digits.'
    }
    return ''
  }

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
      setFormError(errorObject.message || 'Unable to log out. Try again.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validateAddress()
    if (validationError) {
      setFormError(validationError)
      return
    }
    if (!cartItems.length) {
      setFormError('Your cart is empty.')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const orderData = await createPaymentOrder(
        Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()]))
      )
      setPaymentSummary(orderData)

      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error('Unable to load secure payment checkout. Please try again.')
      }

      const payment = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: address.fullName.trim(),
          contact: address.phone.trim()
        },
        theme: { color: '#207052' },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            clearCart()
            navigate(`/order-success/${result.order._id}`, { replace: true })
          } catch (errorObject) {
            setFormError(errorObject.message || 'Payment verification failed. Your cart has not been cleared.')
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false)
        }
      })

      payment.on('payment.failed', (response) => {
        setFormError(response.error?.description || 'Payment failed. Your cart has not been cleared. Please try again.')
        setIsSubmitting(false)
      })
      payment.open()
    } catch (errorObject) {
      setFormError(errorObject.message || 'Unable to start checkout.')
      setIsSubmitting(false)
    }
  }

  const summaryItems = paymentSummary?.items || cartItems
  const total = paymentSummary?.totalAmount ?? subtotal

  return (
    <div className="customer-layout">
      <Navbar onLogout={handleLogout} />
      <main className="checkout-page">
        <p className="auth-kicker">Almost yours</p>
        <h1 className="page-title">Checkout</h1>

        {loading && <p className="catalog-state" role="status">Loading your cart...</p>}
        {!loading && error && (
          <section className="catalog-state catalog-state--error" role="alert">
            <h2>Unable to load your cart.</h2>
            <p>{error}</p>
            <button className="button button--outline" type="button" onClick={refreshCart}>Try again</button>
          </section>
        )}
        {!loading && !error && !cartItems.length && (
          <section className="catalog-state cart-empty">
            <h2>Your cart is empty</h2>
            <p>Add an item before checking out.</p>
            <button className="button button--primary" type="button" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </section>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
            <section className="checkout-panel">
              <h2>Shipping Details</h2>
              <div className="checkout-fields">
                <label className="auth-field">
                  <span>Full name</span>
                  <input name="fullName" autoComplete="name" value={address.fullName} onChange={updateAddress} />
                </label>
                <label className="auth-field">
                  <span>Phone</span>
                  <input name="phone" autoComplete="tel" inputMode="tel" value={address.phone} onChange={updateAddress} />
                </label>
                <label className="auth-field checkout-field--wide">
                  <span>Address</span>
                  <input name="addressLine1" autoComplete="street-address" value={address.addressLine1} onChange={updateAddress} />
                </label>
                <label className="auth-field">
                  <span>City</span>
                  <input name="city" autoComplete="address-level2" value={address.city} onChange={updateAddress} />
                </label>
                <label className="auth-field">
                  <span>State</span>
                  <input name="state" autoComplete="address-level1" value={address.state} onChange={updateAddress} />
                </label>
                <label className="auth-field">
                  <span>Pincode</span>
                  <input name="pincode" autoComplete="postal-code" inputMode="numeric" maxLength={6} value={address.pincode} onChange={updateAddress} />
                </label>
              </div>
            </section>

            <aside className="checkout-panel checkout-summary">
              <h2>Order Summary</h2>
              {summaryItems.map((item) => (
                <div className="order-summary__row" key={item.product?._id || item._id}>
                  <span>{item.name || item.product?.name} × {item.quantity}</span>
                  <strong>{formatPrice((item.price ?? item.product?.price ?? 0) * item.quantity)}</strong>
                </div>
              ))}
              <div className="order-summary__row checkout-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              {formError && <p className="error-message" role="alert">{formError}</p>}
              <button className="button button--primary order-summary__button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Opening secure payment...' : 'Place Order'}
              </button>
              <p className="checkout-secure-note">Secure payment by Razorpay Test Mode</p>
            </aside>
          </form>
        )}
      </main>
    </div>
  )
}

export default Checkout
