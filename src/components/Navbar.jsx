import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BarChart2, LogOut, Plus, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar({ session }) {
    const location = useLocation()

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card"
            style={{
                position: 'sticky',
                top: '1rem',
                zIndex: 50,
                padding: '0.75rem 1.5rem',
                margin: '1rem auto 0 auto',
                maxWidth: '95%',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(16px)'
            }}
        >
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <div style={{
                    background: 'var(--primary-gradient)',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex'
                }}>
                    <BarChart2 size={24} color="white" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
                    PollForAll
                </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {session ? (
                    <>
                        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                            <button
                                className="icon-btn"
                                style={{
                                    background: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: 'var(--text-color)',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    width: 'auto'
                                }}
                            >
                                <LayoutDashboard size={18} />
                                <span className="hide-mobile">Dashboard</span>
                            </button>
                        </Link>

                        <Link to="/create" style={{ textDecoration: 'none' }}>
                            <button
                                className="primary-btn"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    width: 'auto'
                                }}
                            >
                                <Plus size={18} />
                                <span className="hide-mobile">New Poll</span>
                            </button>
                        </Link>

                        <div style={{ width: '1px', height: '24px', background: 'var(--surface-border)', margin: '0 0.5rem' }}></div>

                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="icon-btn"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <Link to="/login">
                        <button className="secondary-btn" style={{ padding: '0.5rem 1.5rem', width: 'auto' }}>
                            Sign In
                        </button>
                    </Link>
                )}
            </div>
        </motion.nav>
    )
}
