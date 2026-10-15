const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://shopkart-czew.onrender.com').replace(/\/$/, '')


async function requestJson(url, options = {}) {
	const response = await fetch(url, {
		...options,
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			...(options.headers || {})
		}
	})
	const data = await response.json().catch(() => ({}))

	if (!response.ok) {
		const error = new Error(data.message || `Request failed with status ${response.status}`)
		error.status = response.status
		throw error
	}

	return data
}

export function getProducts({ search = '', category = '', sort = '' } = {}) {
	const url = new URL(`${API_BASE_URL}/products`)

	if (search.trim()) url.searchParams.set('search', search.trim())
	if (category) url.searchParams.set('category', category)
	if (sort) url.searchParams.set('sort', sort)

	return requestJson(url.toString())
}

export async function getProduct(id) {
	const data = await requestJson(`${API_BASE_URL}/products/${encodeURIComponent(id)}`)
	return data.product
}

export async function getWishlist() {
	const data = await requestJson(`${API_BASE_URL}/wishlist`)
	return data.wishlist || []
}

export async function addToWishlist(productId) {
	return requestJson(`${API_BASE_URL}/wishlist/${encodeURIComponent(productId)}`, {
		method: 'POST'
	})
}

export async function removeFromWishlist(productId) {
	return requestJson(`${API_BASE_URL}/wishlist/${encodeURIComponent(productId)}`, {
		method: 'DELETE'
	})
}

export async function getCart() {
	const data = await requestJson(`${API_BASE_URL}/cart`)
	return data
}

export async function addToCart(productId) {
	return requestJson(`${API_BASE_URL}/cart/${encodeURIComponent(productId)}`, {
		method: 'POST'
	})
}

export async function updateCartQuantity(productId, quantity) {
	return requestJson(`${API_BASE_URL}/cart/${encodeURIComponent(productId)}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ quantity })
	})
}

export async function removeFromCart(productId) {
	return requestJson(`${API_BASE_URL}/cart/${encodeURIComponent(productId)}`, {
		method: 'DELETE'
	})
}

export function createPaymentOrder(shippingAddress) {
	return requestJson(`${API_BASE_URL}/orders/create-payment-order`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ shippingAddress })
	})
}

export function verifyPayment(paymentDetails) {
	return requestJson(`${API_BASE_URL}/orders/verify-payment`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(paymentDetails)
	})
}

export async function getOrders() {
	const data = await requestJson(`${API_BASE_URL}/orders`)
	return data.orders || []
}

export async function getOrder(orderId) {
	const data = await requestJson(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`)
	return data.order
}
