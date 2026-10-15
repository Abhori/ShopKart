import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WishlistCard from '../components/WishlistCard'
import { getWishlist, removeFromWishlist } from '../services/api'
import { useCart } from '../context/useCart'

function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const handleLogout = async () => {
    try {
     
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://shopkart-czew.onrender.com'
).replace(/\/$/, '');

await fetch(`${API_BASE_URL}/customers/logout`, {
  method: 'POST',
  credentials: 'include',
  headers: { Accept: 'application/json' }
});

      clearCart()
      navigate('/login')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to log out. Try again.')
    }
  }

  useEffect(() => {
    let isActive = true

    setIsLoading(true)
    setErrorMessage('')

    getWishlist()
      .then((items) => {
        if (isActive) setWishlist(items || [])
      })
      .catch((error) => {
        if (isActive) setErrorMessage(error.message || 'Unable to load wishlist.')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [retryCount])

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId)
      setWishlist((current) => current.filter((product) => product._id !== productId))
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to remove product from wishlist.')
    }
  }

  return (
    <div className="customer-layout">
      <Navbar onLogout={handleLogout} />
      <main className="catalog-page wishlist-page">
        <div className="catalog-heading">
          <div>
            <p className="auth-kicker">Saved items</p>
            <h1 className="page-title">My Wishlist</h1>
          </div>
          {!isLoading && !errorMessage && <p className="catalog-count">{wishlist.length} product{wishlist.length === 1 ? '' : 's'} saved</p>}
        </div>

        {isLoading && <p className="catalog-state" role="status">Loading your wishlist...</p>}

        {!isLoading && errorMessage && (
          <section className="catalog-state catalog-state--error" role="alert">
            <h2>Unable to load wishlist.</h2>
            <p>{errorMessage}</p>
            <button className="button button--outline" type="button" onClick={() => setRetryCount((count) => count + 1)}>
              Try again
            </button>
          </section>
        )}

        {!isLoading && !errorMessage && wishlist.length === 0 && (
          <section className="catalog-state wishlist-empty" aria-live="polite">
            <h2>Your wishlist is empty ❤️</h2>
            <p>Start saving products you love.</p>
            <button className="button button--primary" type="button" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </section>
        )}

        {!isLoading && !errorMessage && wishlist.length > 0 && (
          <section className="wishlist-grid" aria-label="Wishlist products">
            {wishlist.map((product) => (
              <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default Wishlist
