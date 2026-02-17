import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, MessageSquare, Calendar, ArrowRight } from 'lucide-react'

export default function AllPolls() {
    const [polls, setPolls] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPolls()
    }, [])

    const fetchPolls = async () => {
        try {
            const { data, error } = await supabase
                .from('polls')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setPolls(data)
        } catch (error) {
            console.error('Error fetching polls:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                <Loader2 className="spin" size={32} color="var(--primary-color)" />
            </div>
        )
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem', textAlign: 'center' }}
            >
                All Polls 🗳️
            </motion.h2>

            {polls.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No polls found. Be the first to create one!</p>
                    <Link to="/create">
                        <button className="primary-btn" style={{ marginTop: '1rem', width: 'auto' }}>
                            Create Poll
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <AnimatePresence>
                        {polls.map((poll, index) => (
                            <motion.div
                                key={poll.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/poll/${poll.id}`} style={{ textDecoration: 'none' }}>
                                    <div className="glass-card poll-card-hover" style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.2rem',
                                                marginBottom: '0.5rem',
                                                color: 'var(--text-color)'
                                            }}>
                                                {poll.question}
                                            </h3>
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                fontSize: '0.9rem',
                                                color: 'var(--text-muted)'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} />
                                                    {new Date(poll.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'var(--surface-color)',
                                            padding: '0.5rem',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <ArrowRight size={20} color="var(--primary-color)" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
