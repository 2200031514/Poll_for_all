export default function Footer() {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div
                className="glass-card"
                style={{
                    maxWidth: '95%',
                    margin: '0 auto',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div>
                    © {new Date().getFullYear()} PollForAll. All rights reserved.
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Privacy</a>
                    <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Terms</a>
                    <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>GitHub</a>
                </div>
            </div>
        </footer>
    )
}
