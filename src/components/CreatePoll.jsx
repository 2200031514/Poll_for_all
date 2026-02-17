import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Loader2, ShieldCheck, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CreatePoll({ session }) {
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState(['', ''])
    const [requireAuth, setRequireAuth] = useState(true) // Always true now
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!session && !loading) {
            // Redirect if not logged in
            // actually we rely on higher level or just check session here
        }
    }, [session, loading])

    if (!session) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p>You must be signed in to create a poll.</p>
                <div style={{ maxWidth: '300px', margin: '1rem auto' }}>
                    <button className="primary-btn" onClick={() => navigate('/login')}>Sign In</button>
                </div>
            </div>
        )
    }

    const handleAddOption = () => {
        setOptions([...options, ''])
    }

    const handleRemoveOption = (index) => {
        if (options.length <= 2) return
        const newOptions = options.filter((_, i) => i !== index)
        setOptions(newOptions)
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!question.trim() || options.some(opt => !opt.trim())) {
            alert('Please fill out all fields')
            return
        }

        setLoading(true)
        try {
            // 1. Create Poll
            // We explicitly set created_by to session.user.id, though RLS might handle it if default
            // but let's be safe. Also require_auth is forcefully true.
            const { data: pollData, error: pollError } = await supabase
                .from('polls')
                .insert([{
                    question,
                    require_auth: true,
                    created_by: session.user.id
                }])
                .select()
                .single()

            if (pollError) throw pollError

            // 2. Create Options
            const optionsData = options.map(text => ({
                poll_id: pollData.id,
                text
            }))

            const { error: optionsError } = await supabase
                .from('options')
                .insert(optionsData)

            if (optionsError) throw optionsError

            navigate(`/poll/${pollData.id}`)
        } catch (error) {
            console.error('Error creating poll:', error)
            alert('Error creating poll: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
            >
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create a New Poll</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="question">Prompt / Question</label>
                        <input
                            id="question"
                            type="text"
                            placeholder="e.g. What should we eat for lunch?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="input-field"
                            style={{ fontSize: '1.2rem', padding: '1rem' }}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Voting Options</label>
                        {options.map((option, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={index}
                                className="option-row"
                            >
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder={`Option ${index + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="icon-btn"
                                        aria-label="Remove option"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <button type="button" onClick={handleAddOption} className="secondary-btn" style={{ marginBottom: '2rem' }}>
                        <Plus size={18} /> Add Another Option
                    </button>

                    <div className="form-group" style={{
                        background: 'rgba(16, 185, 129, 0.05)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <ShieldCheck size={20} color="#10b981" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            This poll will require voters to sign in (Fairness Mode Active).
                        </span>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? <Loader2 className="spin" size={20} /> : 'Launch Poll 🚀'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
