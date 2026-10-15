import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Register() {

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()


  async function handleRegister(event) {
  event.preventDefault()
  setErrorMessage('')
  setIsSubmitting(true)

  try {
    
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://shopkart-czew.onrender.com'
).replace(/\/$/, '');

const response = await axios.post(
  `${API_BASE_URL}/customers/register`,
  {
    fullName: fullName,
    email: email,
    password: password,
    phone: phone
  },
  {
    withCredentials: true
  }
);


    console.log(response.data)
    navigate('/login')

  } catch (error) {
    const status = error.response?.status
    const serverMessage = error.response?.data?.message

    if (serverMessage) {
      setErrorMessage(serverMessage)
    } else if (status === 500) {
      setErrorMessage('Server error. Check that MongoDB is connected in the backend terminal.')
    } else if (status) {
      setErrorMessage(`Registration failed (HTTP ${status}).`)
    } else {
      setErrorMessage('Cannot reach the backend. Make sure it is running on port 3000.')
    }
  } finally {
    setIsSubmitting(false)
  }
}

    return (
        <main className="auth-shell">
          <section className="auth-panel">
            <Link className="site-brand auth-brand" to="/login">ShopKart<span>Customer account</span></Link>
            <p className="auth-kicker">New customer</p>
            <h1 className="auth-title">Create your account</h1>

            <form className="auth-form" onSubmit={handleRegister}>
            <label className="auth-field">
              <span>Full name</span>
              <input
               type="text"
               autoComplete="name"
               required
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
              />
            </label>

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
               autoComplete="new-password"
               minLength={6}
               required
               value={password}
               onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            
            <label className="auth-field">
              <span>Phone number</span>
              <input
               type="tel"
               autoComplete="tel"
               required
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}

            <button className="button button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
            </form>
            <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
          </section>
        </main>
    )
}

export default Register