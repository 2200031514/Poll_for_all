import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Share2, LogIn, Lock, Camera, X } from 'lucide-react'
import Login from './Login'

export default function PollView({ session }) {
    const { id } = useParams()
    const [poll, setPoll] = useState(null)
    const [options, setOptions] = useState([])
    const [votes, setVotes] = useState({})
    const [hasVoted, setHasVoted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [copied, setCopied] = useState(false)

    // Owner State
    const [isOwner, setIsOwner] = useState(false)
    const [detailedVotes, setDetailedVotes] = useState([])

    // Camera State
    const [showCamera, setShowCamera] = useState(false)
    const [selectedOption, setSelectedOption] = useState(null)
    const [cameraStream, setCameraStream] = useState(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        fetchPollData()
        const channel = supabase
            .channel('realtime-votes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'votes',
                    filter: `poll_id=eq.${id}`,
                },
                (payload) => {
                    setVotes((prev) => {
                        const optionId = payload.new.option_id
                        return {
                            ...prev,
                            [optionId]: (prev[optionId] || 0) + 1,
                        }
                    })
                    // If owner, refresh detailed list
                    if (isOwner) fetchDetailedVotes()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, isOwner])

    useEffect(() => {
        checkIfVoted()
    }, [id, session])

    const fetchPollData = async () => {
        try {
            setLoading(true)
            const { data: pollData, error: pollError } = await supabase
                .from('polls')
                .select('*')
                .eq('id', id)
                .single()

            if (pollError) throw pollError
            setPoll(pollData)

            // Check ownership
            if (session?.user?.id === pollData.created_by) {
                setIsOwner(true)
                fetchDetailedVotes() // Fetch initial details
            }

            const { data: optionsData, error: optionsError } = await supabase
                .from('options')
                .select('*')
                .eq('poll_id', id)
                .order('id')

            if (optionsError) throw optionsError
            setOptions(optionsData)

            const { data: votesData, error: votesError } = await supabase
                .from('votes')
                .select('option_id')
                .eq('poll_id', id)

            if (votesError) throw votesError

            const voteCounts = {}
            votesData.forEach((vote) => {
                voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1
            })
            setVotes(voteCounts)

        } catch (err) {
            console.error('Error fetching poll:', err)
            setError('Poll not found.')
        } finally {
            setLoading(false)
        }
    }

    const fetchDetailedVotes = async () => {
        const { data, error } = await supabase
            .from('votes')
            .select('*, options(text)')
            .eq('poll_id', id)
            .order('created_at', { ascending: false })

        if (!error) {
            setDetailedVotes(data)
        }
    }

    const checkIfVoted = async () => {
        if (session?.user) {
            const { data } = await supabase
                .from('votes')
                .select('id')
                .eq('poll_id', id)
                .eq('user_id', session.user.id)
                .limit(1)

            if (data && data.length > 0) {
                setHasVoted(true)
                return
            }
        }
    }

    const initiateVote = (optionId) => {
        if (!session) {
            alert("Please sign in to vote.")
            return
        }
        setSelectedOption(optionId)
        setShowCamera(true)
        setTimeout(() => startCamera(), 100)
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            setCameraStream(stream)
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (err) {
            console.error("Camera error:", err)
            alert("We need camera access to verify your vote! Please allow it.")
            setShowCamera(false)
        }
    }

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop())
            setCameraStream(null)
        }
        setShowCamera(false)
    }

    const captureAndVote = async () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("Failed to capture image")
                return
            }
            await handleVoteWithImage(blob)
        }, 'image/jpeg', 0.8)
    }

    const handleVoteWithImage = async (imageBlob) => {
        try {
            // 1. Upload Image
            const filename = `${id}/${session.user.id}_${Date.now()}.jpg`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('vote-evidence')
                .upload(filename, imageBlob)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('vote-evidence')
                .getPublicUrl(filename)

            // 2. Submit Vote
            const voteData = {
                poll_id: id,
                option_id: selectedOption,
                user_id: session.user.id,
                evidence_url: publicUrl
            }

            const { error } = await supabase
                .from('votes')
                .insert([voteData])

            if (error) {
                if (error.code === '23505') {
                    alert("You have already voted in this poll!")
                    setHasVoted(true)
                } else {
                    throw error
                }
            } else {
                setHasVoted(true)
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#a855f7', '#ec4899', '#ffffff']
                })
                if (isOwner) fetchDetailedVotes() // Refresh for owner
            }
        } catch (err) {
            alert('Error voting: ' + err.message)
            console.error(err)
        } finally {
            stopCamera()
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}><div className="spin" style={{ display: 'inline-block' }}>⏳</div></div>
    if (error) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>{error}</div>
    if (!poll) return null

    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
            >
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <AnimatePresence>
                        {hasVoted && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="badge badge-success"
                            >
                                <Check size={12} style={{ marginRight: '4px' }} /> Voted
                            </motion.span>
                        )}
                        {isOwner && (
                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)', marginLeft: '0.5rem' }}>
                                👑 Owner View
                            </span>
                        )}
                        {poll.require_auth && !hasVoted && (
                            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)', marginLeft: hasVoted ? '0.5rem' : 0 }}>
                                <Lock size={12} style={{ marginRight: '4px' }} /> Login Required
                            </span>
                        )}
                    </AnimatePresence>
                </div>

                <h2 className="poll-question">{poll.question}</h2>

                {/* Camera Modal */}
                <AnimatePresence>
                    {showCamera && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                            }}
                        >
                            <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '1.5rem', background: '#1e1e1e' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3>Vote Verification</h3>
                                    <button onClick={stopCamera} className="icon-btn"><X /></button>
                                </div>
                                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    Please look at the camera to verify your identity.
                                </p>
                                <div style={{
                                    width: '100%', height: '250px', background: '#000', borderRadius: '12px',
                                    overflow: 'hidden', marginBottom: '1.5rem', position: 'relative'
                                }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                <button onClick={captureAndVote} className="primary-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Camera size={20} /> Capture & Vote
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {poll.require_auth && !session && !hasVoted ? (
                    <div style={{ textAlign: 'center', margin: '2rem 0', padding: '2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <Lock size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                        <p>This poll requires you to be signed in to verify your vote.</p>
                        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                            <Login />
                        </div>
                    </div>
                ) : !hasVoted ? (
                    <div className="voting-section">
                        {options.map((option) => (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={option.id}
                                className="vote-option"
                                onClick={() => initiateVote(option.id)}
                            >
                                <span>{option.text}</span>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="results-section">
                        {options.map((option) => {
                            const count = votes[option.id] || 0
                            const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100)

                            return (
                                <div key={option.id} className="result-bar-container">
                                    <div className="result-header">
                                        <span>{option.text}</span>
                                        <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
                                    </div>
                                    <div className="result-bar-bg">
                                        <motion.div
                                            className="result-bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.2rem' }}>
                                        {count} votes
                                    </div>
                                </div>
                            )
                        })}
                        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Total votes: <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>{totalVotes}</span>
                        </div>
                    </div>
                )}

                {isOwner && (
                    <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>📊 Voter Verification</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Only you (the owner) can see this section. Establish confidence in your results with photo evidence.
                        </p>

                        {detailedVotes.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No votes yet.</p>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: '1rem'
                            }}>
                                {detailedVotes.map(vote => (
                                    <div key={vote.id} className="glass-card" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '4/3',
                                            backgroundColor: '#000',
                                            borderRadius: '8px',
                                            marginBottom: '0.75rem',
                                            overflow: 'hidden',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {vote.evidence_url ? (
                                                <img src={vote.evidence_url} alt="Verification" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ color: '#666' }}>No Image</span>
                                            )}
                                        </div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                            {vote.options?.text || 'Unknown Option'}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                            User: {vote.user_id.slice(0, 8)}...
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            {new Date(vote.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                        <Share2 size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Share this poll</span>
                    </div>
                    <button
                        className="secondary-btn"
                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={copyLink}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
