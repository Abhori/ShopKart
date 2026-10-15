import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/useCart'
import { addToWishlist, getProduct, getWishlist } from '../services/api'

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(price)

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [wishlistIds, setWishlistIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [wishlistMessage, setWishlistMessage] = useState('')
  const [savingWishlist, setSavingWishlist] = useState(false)
  const { cartItems, addToCart, pendingProductId, clearCart } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/customers/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })
      clearCart()
      navigate('/login')
    } catch (error) {
      setWishlistMessage(error.message || 'Unable to log out. Try again.')
    }
  }

  useEffect(() => {
    let isActive = true

    const loadWishlist = async () => {
      try {
        const items = await getWishlist()
        if (isActive) setWishlistIds((items || []).map((item) => item._id))
      } catch (error) {
        if (isActive && error.status !== 401) {
          setWishlistMessage(error.message || 'Unable to sync wishlist.')
        }
      }
    }

    Promise.all([getProduct(id), loadWishlist()])
      .then(([result]) => {
        if (isActive) setProduct(result)
      })
      .catch((error) => {
        if (isActive) setErrorMessage(error.message)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [id])

  const handleAddToWishlist = async () => {
    if (!product || savingWishlist || wishlistIds.includes(product._id)) return

    setSavingWishlist(true)
    setWishlistMessage('')

    try {
      await addToWishlist(product._id)
      setWishlistIds((current) => [...current, product._id])
    } catch (error) {
      setWishlistMessage(error.message || 'Unable to save product. Please try again.')
    } finally {
      setSavingWishlist(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      await addToCart(product._id)
    } catch (error) {
      setWishlistMessage(error.message || 'Unable to add product to cart.')
    }
  }

  return (
    <div className="customer-layout">
      <Navbar onLogout={handleLogout} />
      <main className="detail-page">
        <Link className="back-link" to="/products">&larr; Back to products</Link>
        {isLoading && <p className="catalog-state" role="status">Loading product...</p>}
        {!isLoading && errorMessage && (
          <section className="catalog-state catalog-state--error" role="alert">
            <h1>Unable to load this product.</h1>
            <p>{errorMessage}</p>
          </section>
        )}
        {!isLoading && !errorMessage && product && (
          <article className="product-detail">
            <div className="product-detail__media">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-detail__copy">
              <p className="product-category">{product.category}</p>
              <h1 className="page-title">{product.name}</h1>
              <p className="product-detail__description">{product.description}</p>
              <p className="product-detail__price">{formatPrice(product.price)}</p>
              <p className={product.stock > 0 ? 'stock-status' : 'stock-status stock-status--empty'}>
                {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
              </p>

              {wishlistMessage && <p className="error-message" role="alert">{wishlistMessage}</p>}

              <div className="detail-actions">
                <button
                  className="button button--primary detail-add-button"
                  type="button"
                  disabled={product.stock < 1 || pendingProductId === product._id}
                  onClick={handleAddToCart}
                >
                  {product.stock < 1 ? 'Out of stock' : pendingProductId === product._id ? 'Adding...' : cartItems.some((item) => item.product?._id === product._id) ? 'Add Another' : 'Add to cart'}
                </button>
                <button
                  className={`button detail-wishlist-button ${wishlistIds.includes(product._id) ? 'button--primary' : 'button--outline'}`}
                  type="button"
                  disabled={savingWishlist || wishlistIds.includes(product._id)}
                  onClick={handleAddToWishlist}
                >
                  {savingWishlist ? '⏳ Saving...' : wishlistIds.includes(product._id) ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
                </button>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}

export default ProductDetails