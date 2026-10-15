import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { useCart } from '../context/useCart'
import { addToWishlist, getProducts, getWishlist } from '../services/api'

function Products() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('')
  const [products, setProducts] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [savingProductId, setSavingProductId] = useState(null)
  const [wishlistError, setWishlistError] = useState('')
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
      setWishlistError(error.message || 'Unable to log out. Try again.')
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
          setWishlistError(error.message || 'Unable to load wishlist.')
        }
      }
    }

    const timer = window.setTimeout(() => {
      setIsLoading(true)
      setErrorMessage('')
      Promise.all([
        getProducts({ search, category, sort }),
        loadWishlist()
      ])
        .then(([data]) => {
          if (isActive) setProducts(data.products || [])
        })
        .catch((error) => {
          if (isActive) setErrorMessage(error.message)
        })
        .finally(() => {
          if (isActive) setIsLoading(false)
        })
    }, search ? 250 : 0)

    return () => {
      isActive = false
      window.clearTimeout(timer)
    }
  }, [search, category, sort, retryCount])

  const handleAddToWishlist = async (productId) => {
    if (savingProductId || wishlistIds.includes(productId)) return

    setSavingProductId(productId)
    setWishlistError('')

    try {
      await addToWishlist(productId)
      setWishlistIds((current) => [...current, productId])
    } catch (error) {
      setWishlistError(error.message || 'Unable to save product. Please try again.')
    } finally {
      setSavingProductId(null)
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId)
    } catch (error) {
      setWishlistError(error.message || 'Unable to add product to cart.')
    }
  }

  return (
    <div className="customer-layout">
      <Navbar onLogout={handleLogout} />
      <main className="catalog-page">
        <div className="catalog-heading">
          <div>
            <p className="auth-kicker">ShopKart collection</p>
            <h1 className="page-title">Find your next favorite</h1>
          </div>
          {!isLoading && !errorMessage && <p className="catalog-count">{products.length} products</p>}
        </div>

        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        {wishlistError && <p className="error-message" role="alert">{wishlistError}</p>}

        {isLoading && <p className="catalog-state" role="status">Loading products...</p>}
        {!isLoading && errorMessage && (
          <section className="catalog-state catalog-state--error" role="alert">
            <h2>Something went wrong while loading products.</h2>
            <p>{errorMessage}</p>
            <button className="button button--outline" type="button" onClick={() => setRetryCount((count) => count + 1)}>
              Try again
            </button>
          </section>
        )}
        {!isLoading && !errorMessage && products.length === 0 && (
          <p className="catalog-state">No products found.</p>
        )}
        {!isLoading && !errorMessage && products.length > 0 && (
          <section className="product-grid" aria-label="Products">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToWishlist={handleAddToWishlist}
                isSaved={wishlistIds.includes(product._id)}
                isSaving={savingProductId === product._id}
                onAddToCart={handleAddToCart}
                isInCart={cartItems.some((item) => item.product?._id === product._id)}
                isAddingToCart={pendingProductId === product._id}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default Products