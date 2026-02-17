import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'
import { BarChart, PieChart, Plus, ArrowRight } from 'lucide-react'

export default function Dashboard({ session }) {
    const [myPolls, setMyPolls] = useState([])
    const [votedPolls, setVotedPolls] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user) {
            fetchDashboardData()
        }
    }, [session])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const userId = session.user.id

            // 1. Fetch polls created by me
            const { data: createdData, error: createdError } = await supabase
                .from('polls')
                .select('*')
                .eq('created_by', userId)
                .order('created_at', { ascending: false })

            if (createdError) throw createdError
            setMyPolls(createdData)

            // 2. Fetch polls I voted in
            // We first get the votes, using a join to get poll details
            const { data: votesData, error: votesError } = await supabase
                .from('votes')
                .select(`
            poll_id,
            polls (
                id,
                question,
                created_at,
                created_by
            )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (votesError) throw votesError

            // Extract unique polls
            const uniquePolls = []
            const seen = new Set()
            votesData.forEach(item => {
                if (item.polls && !seen.has(item.polls.id)) {
                    // Add property to identify if I own it or just voted
                    const poll = item.polls
                    uniquePolls.push(poll)
                    seen.add(poll.id)
                }
            })
            setVotedPolls(uniquePolls)

        } catch (error) {
            console.error('Error fetching dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Dashboard</h2>
                <Link to="/create">
                    <button className="primary-btn" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Poll
                    </button>
                </Link>
            </div>

            <section style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart size={20} color="var(--accent-color)" /> My Polls
                </h3>
                {myPolls.length === 0 ? (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        You haven't created any polls yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {myPolls.map(poll => (
                            <DashboardCard key={poll.id} poll={poll} type="created" />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PieChart size={20} color="#10b981" /> Participated
                </h3>
                {votedPolls.length === 0 ? (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        You haven't voted in any polls yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {votedPolls.map(poll => (
                            <DashboardCard key={poll.id} poll={poll} type="voted" />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

function DashboardCard({ poll, type }) {
    return (
        <Link to={`/poll/${poll.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <motion.div
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                className="glass-card"
                style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }}
            >
                <div>
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {poll.question}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {new Date(poll.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {type === 'created' ? <span className="badge badge-success" style={{ marginBottom: 0 }}>Owner</span> : <span className="badge" style={{ marginBottom: 0, background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>Voter</span>}
                    <ArrowRight size={16} />
                </div>
            </motion.div>
        </Link>
    )
}
