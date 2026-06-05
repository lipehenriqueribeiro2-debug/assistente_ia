import { useState, useEffect } from 'react';

export function SearchIndicator({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    // Inicialização
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const kbdStyle: React.CSSProperties = {
    fontFamily: '"Share Tech Mono", monospace',
    fontSize: 9,
    background: 'var(--item-bg)',
    border: '1px solid var(--border-card)',
    borderBottom: `2.5px solid ${theme === 'light' ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.25)'}`,
    borderRadius: '4px',
    padding: '2px 5px',
    margin: '0 2px',
    color: 'var(--text-white)',
    boxShadow: `0 1px 2px ${theme === 'light' ? 'rgba(15, 23, 42, 0.12)' : 'rgba(0,0,0,0.4)'}`,
    fontWeight: 600,
  };

  const accentColor = theme === 'light' ? '#0f767a' : '#25ced1';
  const textCol = theme === 'light' ? '#0f767a' : 'rgba(37, 206, 209, 0.8)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-card-solid)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid rgba(37, 206, 209, ${theme === 'light' ? '0.35' : '0.22'})`,
        borderRadius: '2rem',
        padding: '0.45rem 1rem',
        color: textCol,
        fontFamily: '"Share Tech Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.8px',
        boxShadow: `0 8px 32px rgba(37, 206, 209, ${theme === 'light' ? '0.03' : '0.05'}), 0 0 15px rgba(37, 206, 209, 0.03)`,
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        textTransform: 'uppercase',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = `rgba(37, 206, 209, ${theme === 'light' ? '0.6' : '0.45'})`;
        e.currentTarget.style.backgroundColor = 'var(--bg-card-solid)';
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(37, 206, 209, ${theme === 'light' ? '0.08' : '0.12'}), 0 0 20px rgba(37, 206, 209, 0.08)`;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.color = accentColor;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = `rgba(37, 206, 209, ${theme === 'light' ? '0.35' : '0.22'})`;
        e.currentTarget.style.backgroundColor = 'var(--bg-card-solid)';
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(37, 206, 209, ${theme === 'light' ? '0.03' : '0.05'}), 0 0 15px rgba(37, 206, 209, 0.03)`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.color = textCol;
      }}
    >
      {/* Ícone de busca premium */}
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: 8, color: '#25ced1' }}
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>

      {isMobile ? (
        <span>Toque para iniciar busca global</span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          Pressione <kbd style={kbdStyle}>Ctrl</kbd> + <kbd style={kbdStyle}>K</kbd> para busca global.
        </span>
      )}
    </div>
  );
}
