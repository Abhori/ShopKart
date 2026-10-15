
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/useCart'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()
    const { refreshCart } = useCart()

    // Use the deployed backend URL, with a local development fallback.
    const API_BASE_URL = (
        import.meta.env.VITE_API_URL ||
        'https://shopkart-czew.onrender.com'
    ).replace(/\/$/, '')

    async function handleLogin(event) {
        event.preventDefault()
        setErrorMessage('')
        setIsSubmitting(true)

        try {
            await axios.post(
                `${API_BASE_URL}/customers/login`,
                {
                    email: email,
                    password: password
                },
                {
                    withCredentials: true
                }
            )

            await refreshCart()
            setErrorMessage('')
            navigate('/home')
        } catch (error) {
            console.error('Login error:', error)

            setErrorMessage(
                error.response?.data?.message ||
                (error.message === 'Network Error'
                    ? 'Unable to connect to the server. Please try again.'
                    : error.message) ||
                'Login failed'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="auth-shell">
            <section className="auth-panel">
                <Link className="site-brand auth-brand" to="/login">
                    ShopKart
                    <span>Customer account</span>
                </Link>

                <p className="auth-kicker">Welcome back</p>
                <h1 className="auth-title">Log in</h1>

                <form className="auth-form" onSubmit={handleLogin}>
                    <label className="auth-field">
                        <span>Email</span>
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label className="auth-field">
                        <span>Password</span>
                        <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    {errorMessage && (
                        <p className="error-message" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        className="button button--primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Log in'}
                    </button>
                </form>

                <p className="auth-switch">
                    New to ShopKart? <Link to="/register">Create an account</Link>
                </p>
            </section>
        </main>
    )
}

export default Login
