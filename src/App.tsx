import React from 'react';
import { useTheme } from './theme/useTheme';

function ThemeDemo() {
  const { mode, palette, toggleMode } = useTheme();
  const [form, setForm] = React.useState({ name: '', email: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.background,
        color: palette.textPrimary,
        transition: 'background 0.3s, color 0.3s',
        padding: 32,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ color: palette.primary }}>Theme Demo</h1>
        <button
          onClick={toggleMode}
          style={{
            background: palette.accent,
            color: palette.surface,
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `0 2px 8px ${mode === 'light' ? '#0001' : '#0008'}`,
            transition: 'background 0.2s',
          }}
        >
          Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
      <form
        style={{
          background: palette.surface,
          color: palette.textPrimary,
          borderRadius: 12,
          boxShadow: `0 2px 12px ${mode === 'light' ? '#0001' : '#0007'}`,
          padding: 32,
          maxWidth: 400,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
        onSubmit={e => { e.preventDefault(); alert(`Hello, ${form.name || 'user'}!`); }}
      >
        <label style={{ color: palette.textSecondary }}>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: 8,
              border: `1px solid ${palette.primary}`,
              borderRadius: 4,
              marginTop: 4,
              background: mode === 'light' ? '#fff' : palette.background,
              color: palette.textPrimary,
            }}
            autoComplete="off"
          />
        </label>
        <label style={{ color: palette.textSecondary }}>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: 8,
              border: `1px solid ${palette.secondary}`,
              borderRadius: 4,
              marginTop: 4,
              background: mode === 'light' ? '#fff' : palette.background,
              color: palette.textPrimary,
            }}
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          style={{
            background: palette.primary,
            color: palette.background,
            border: 'none',
            borderRadius: 6,
            padding: '10px 0',
            fontWeight: 700,
            fontSize: 16,
            marginTop: 8,
            cursor: 'pointer',
            boxShadow: `0 1px 6px ${mode === 'light' ? '#00ffe033' : '#00ffe055'}`,
            transition: 'background 0.2s',
          }}
        >
          Submit
        </button>
      </form>
      <div style={{ marginTop: 40, textAlign: 'center', color: palette.textSecondary }}>
        <span style={{ color: palette.success, fontWeight: 600 }}>Success</span> &nbsp;|&nbsp;
        <span style={{ color: palette.error, fontWeight: 600 }}>Error</span> &nbsp;|&nbsp;
        <span style={{ color: palette.warning, fontWeight: 600 }}>Warning</span>
      </div>
    </div>
  );
}

function App() {
  return <ThemeDemo />;
}

export default App;
