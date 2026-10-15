import { Link } from 'react-router-dom'

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(price)

function WishlistCard({ product, onRemove }) {
  return (
    <article className="wishlist-card">
      <Link className="wishlist-card__image-link" to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
        <img className="wishlist-card__image" src={product.image} alt={product.name} loading="lazy" />
      </Link>

      <div className="wishlist-card__body">
        <p className="product-category">{product.category}</p>
        <h2 className="wishlist-card__name">{product.name}</h2>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? 'stock-status' : 'stock-status stock-status--empty'}>
          {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
        </p>

        <div className="wishlist-card__actions">
          <Link className="button button--outline wishlist-card__action" to={`/products/${product._id}`}>
            View details
          </Link>
          <button className="button button--outline wishlist-card__remove" type="button" onClick={() => onRemove(product._id)}>
            Remove ♥
          </button>
        </div>
      </div>
    </article>
  )
}

export default WishlistCard
