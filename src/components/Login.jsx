import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                alert('Check your email for the confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate('/dashboard')
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container" style={{ maxWidth: '450px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                    <p>{isSignUp ? 'Join PollForAll to create and manage polls.' : 'Sign in to access your dashboard.'}</p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                padding: '0.75rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        className="secondary-btn"
                        style={{ display: 'inline', width: 'auto', padding: '0', border: 'none', color: 'var(--accent-color)', textDecoration: 'underline' }}
                        onClick={() => {
                            setIsSignUp(!isSignUp)
                            setError(null)
                        }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
