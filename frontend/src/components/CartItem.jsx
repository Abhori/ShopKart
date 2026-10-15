const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(price)

function CartItem({ item, onIncrement, onDecrement, onRemove, isUpdating }) {
  const { product, quantity } = item

  return (
    <article className="cart-item">
      <div className="cart-item__media">
        <img src={product?.image} alt={product?.name} />
      </div>

      <div className="cart-item__details">
        <div className="cart-item__header">
          <h2>{product?.name}</h2>
          <p>{formatPrice((product?.price || 0) * quantity)}</p>
        </div>

        <div className="cart-item__controls">
          <div className="quantity-control" aria-label={`Quantity for ${product?.name}`}>
            <button type="button" onClick={() => onDecrement(product?._id)} disabled={isUpdating || quantity <= 1}>-</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => onIncrement(product?._id)} disabled={isUpdating || quantity >= (product?.stock || 0)}>+</button>
          </div>

          <button className="button button--outline cart-remove-button" type="button" onClick={() => onRemove(product?._id)} disabled={isUpdating}>
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

export default CartItem
