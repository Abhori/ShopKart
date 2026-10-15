import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/useCart'

function Home() {
    const [user, setUser] = useState(null)
    const [logoutError, setLogoutError] = useState('')
    const navigate = useNavigate()
    const { clearCart } = useCart()

    async function handleLogout() {
        try {
            await axios.post(
                'http://localhost:3000/customers/logout',
                {},
                {
                    withCredentials: true 
                }
            )

            clearCart()
            navigate('/login')
        }
        catch (error) {
            setLogoutError(error.response?.data?.message || 'Unable to log out. Try again.')
        }
    }

    useEffect(() => {
        let isActive = true

        axios.get('http://localhost:3000/customers/me', {
            withCredentials: true
        })
            .then((response) => {
                if (isActive) setUser(response.data)
            })
            .catch(() => {
                if (isActive) navigate('/login')
            })

        return () => {
            isActive = false
        }
    }, [navigate])


  return (
    <div className="customer-layout">
        <Navbar onLogout={handleLogout} />
        <main className="home-page">
            <p className="auth-kicker">Customer profile</p>
            <h1 className="page-title">Welcome to ShopKart</h1>
            {logoutError && <p className="error-message" role="alert">{logoutError}</p>}
            {user && (
                <section className="profile-panel" aria-label="Customer information">
                    <h2>{user.fullName}</h2>
                    <dl className="profile-details">
                        <div><dt>Email</dt><dd>{user.email}</dd></div>
                        <div><dt>Phone</dt><dd>{user.phone}</dd></div>
                    </dl>
                </section>
            )}
        </main>
    </div>
  )
}

export default Home