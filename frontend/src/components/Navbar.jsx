import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'

function Navbar({ onLogout, wishlistCount = 0 }) {
	const { cartCount } = useCart()

	return (
		<header className="site-header">
			<Link className="site-brand" to="/home">
				ShopKart
				<span>Find something good</span>
			</Link>
			<nav className="site-navigation" aria-label="Main navigation">
				<Link to="/home">Home</Link>
				<Link to="/products">Products</Link>
				<Link to="/wishlist">Wishlist{wishlistCount ? ` (${wishlistCount})` : ''}</Link>
				<Link to="/cart">Cart ({cartCount})</Link>
				<Link to="/orders">My Orders</Link>
				{onLogout
					? <button className="button button--outline" type="button" onClick={onLogout}>Log out</button>
					: <Link to="/login">Log in</Link>}
			</nav>
		</header>
	)
}

export default Navbar
