import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart2, ShieldCheck, Zap } from 'lucide-react'

export default function Home({ session }) {
    return (
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <span className="badge badge-success" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    Live Polling v1.0
                </span>
                <h1 style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                    Instant Polls,<br /> Real-Time Results.
                </h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                    Create interactive polls in seconds. Share the link. Watch votes roll in live. No registration required (unless you want it!).
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
                    {session ? (
                        <>
                            <Link to="/create">
                                <button className="primary-btn" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                                    Create a Poll
                                </button>
                            </Link>
                            <Link to="/dashboard">
                                <button className="secondary-btn" style={{ fontSize: '1.1rem', padding: '1rem 2rem', borderStyle: 'solid' }}>
                                    Dashboard
                                </button>
                            </Link>
                        </>
                    ) : (
                        <Link to="/login">
                            <button className="primary-btn" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                                Sign In to Start
                            </button>
                        </Link>
                    )}
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                <FeatureCard
                    icon={<Zap color="#f59e0b" />}
                    title="Real-Time"
                    desc="Votes update instantly on everyone's screen. No refreshing needed."
                />
                <FeatureCard
                    icon={<ShieldCheck color="#10b981" />}
                    title="Fair & Secure"
                    desc="Prevent duplicate voting with smart fingerprinting and optional authentication."
                />
                <FeatureCard
                    icon={<BarChart2 color="#8b5cf6" />}
                    title="Visual Results"
                    desc="Beautiful, animated progress bars that make data easy to understand."
                />
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card"
            style={{ padding: '2rem', borderRadius: '16px' }}
        >
            <div style={{ marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>{desc}</p>
        </motion.div>
    )
}
