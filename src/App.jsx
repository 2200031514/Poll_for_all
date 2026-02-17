import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import CreatePoll from './components/CreatePoll'
import PollView from './components/PollView'
import Home from './components/Home'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
    const [session, setSession] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <div className="app-container">
            <Navbar session={session} />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home session={session} />} />
                    <Route path="/create" element={<CreatePoll session={session} />} />
                    <Route path="/poll/:id" element={<PollView session={session} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard session={session} />} />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
