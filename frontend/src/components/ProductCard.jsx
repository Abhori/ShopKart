import { Link } from 'react-router-dom'

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(price)

function ProductCard({
  product,
  onAddToWishlist,
  isSaved = false,
  isSaving = false,
  onAddToCart,
  isInCart = false,
  isAddingToCart = false
}) {
  return (
    <article className="product-card">
      <Link className="product-card__image-link" to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
        <img className="product-card__image" src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-card__body">
        <p className="product-category">{product.category}</p>
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? 'stock-status' : 'stock-status stock-status--empty'}>
          {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
        </p>
        <div className="product-card__actions">
          <Link className="button button--primary product-card__action" to={`/products/${product._id}`}>
            View details
          </Link>
          {onAddToCart && (
            <button
              className="button button--outline product-card__wishlist"
              type="button"
              disabled={isAddingToCart || product.stock < 1}
              onClick={() => onAddToCart(product._id)}
            >
              {isAddingToCart ? 'Adding...' : isInCart ? 'Add Another' : 'Add to Cart'}
            </button>
          )}
          {onAddToWishlist && (
            <button
              className={`button button--outline product-card__wishlist ${isSaved ? 'product-card__wishlist--active' : ''}`}
              type="button"
              disabled={isSaving || isSaved}
              onClick={() => onAddToWishlist(product._id)}
            >
              {isSaving ? '⏳ Saving...' : isSaved ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard