import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CartContext from './cart-context'
import {
  addToCart as addToCartApi,
  getCart,
  removeFromCart as removeFromCartApi,
  updateCartQuantity as updateCartQuantityApi
} from '../services/api'

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingProductId, setPendingProductId] = useState(null)
  const [pendingActionIds, setPendingActionIds] = useState([])
  const requestVersion = useRef(0)

  const refreshCart = useCallback(async () => {
    const version = ++requestVersion.current
    setLoading(true)
    setError('')

    try {
      const data = await getCart()
      if (version !== requestVersion.current) return
      setCartItems(data.cart || [])
    } catch (err) {
      if (version !== requestVersion.current) return
      if (err.status !== 401) {
        setError(err.message || 'Unable to load your cart.')
      }
      setCartItems([])
    } finally {
      if (version === requestVersion.current) {
        setLoading(false)
      }
    }
  }, [])

  const clearCart = useCallback(() => {
    requestVersion.current += 1
    setCartItems([])
    setError('')
    setLoading(false)
    setPendingProductId(null)
    setPendingActionIds([])
  }, [])

  useEffect(() => {
    const version = ++requestVersion.current

    const loadInitialCart = async () => {
      try {
        const data = await getCart()
        if (version === requestVersion.current) {
          setCartItems(data.cart || [])
        }
      } catch (err) {
        if (version !== requestVersion.current) return
        if (err.status !== 401) {
          setError(err.message || 'Unable to load your cart.')
        }
        setCartItems([])
      } finally {
        if (version === requestVersion.current) {
          setLoading(false)
        }
      }
    }

    loadInitialCart()
  }, [])

  const addToCart = useCallback(async (productId) => {
    const version = requestVersion.current
    setPendingProductId(productId)

    try {
      const data = await addToCartApi(productId)
      if (version !== requestVersion.current) return
      if (data.cart) {
        setCartItems(data.cart)
      } else {
        await refreshCart()
      }
    } finally {
      setPendingProductId(null)
    }
  }, [refreshCart])

  const updateQuantity = useCallback(async (productId, quantity) => {
    const version = requestVersion.current
    setPendingActionIds((current) => [...current, productId])

    try {
      const data = await updateCartQuantityApi(productId, quantity)
      if (version !== requestVersion.current) return
      if (data.cart) {
        setCartItems(data.cart)
      } else {
        await refreshCart()
      }
    } finally {
      setPendingActionIds((current) => current.filter((id) => id !== productId))
    }
  }, [refreshCart])

  const removeFromCart = useCallback(async (productId) => {
    const version = requestVersion.current
    setPendingActionIds((current) => [...current, productId])

    try {
      const data = await removeFromCartApi(productId)
      if (version !== requestVersion.current) return
      if (data.cart) {
        setCartItems(data.cart)
      } else {
        await refreshCart()
      }
    } finally {
      setPendingActionIds((current) => current.filter((id) => id !== productId))
    }
  }, [refreshCart])

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems]
  )

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + ((item.product?.price || 0) * Number(item.quantity || 0)), 0),
    [cartItems]
  )

  const value = useMemo(() => ({
    cartItems,
    loading,
    error,
    cartCount,
    subtotal,
    pendingProductId,
    pendingActionIds,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCart
  }), [cartItems, loading, error, cartCount, subtotal, pendingProductId, pendingActionIds, addToCart, updateQuantity, removeFromCart, refreshCart, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
