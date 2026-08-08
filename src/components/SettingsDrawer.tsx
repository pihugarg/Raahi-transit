import React from 'react'
import { useSettings } from '../context/SettingsContext'
import { useT } from '../i18n'

export default function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, setLang, lite, setLite } = useSettings()
  const t = useT()

  return (
    <div aria-hidden={!open}>
      {/* overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(2,6,23,.35)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease-in-out', zIndex: 60
      }} />
      {/* drawer */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, height: '100%', width: 420, background: '#fff',
        borderLeft: '1px solid #e5e7eb', boxShadow: '-8px 0 30px rgba(2,6,23,.08)',
        transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .22s ease-in-out', zIndex: 70,
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: 18 }}>Settings</strong>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div style={{ padding: 20, overflow: 'auto' }}>
          {/* Language Card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>🌐</span>
              <h3 style={{ margin: 0 }}>Language</h3>
            </div>
            <div style={{ color: '#64748b', marginBottom: 10 }}>Pick your preferred language.</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {([['en', 'English'], ['hi', 'हिन्दी'], ['pa', 'ਪੰਜਾਬੀ'], ['kn', 'ಕನ್ನಡ']] as const).map(([code, label]) => {
                const active = lang === code
                return (
                  <button key={code} onClick={() => setLang(code as any)}
                    className="btn" style={{
                      borderRadius: 14, padding: '8px 14px',
                      background: active ? '#eef2ff' : '#fff',
                      borderColor: active ? '#c7d2fe' : undefined,
                      fontWeight: 800
                    }}>{label}</button>
                )
              })}
            </div>
          </div>

          {/* Performance Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <h3 style={{ margin: 0 }}>Performance</h3>
            </div>
            <div style={{ color: '#64748b', marginBottom: 10 }}>Lite Mode reduces data use and improves performance.</div>
            <label style={{ display: 'inline-flex', gap: 10, alignItems: 'center', fontWeight: 800 }}>
              <input type="checkbox" checked={lite} onChange={e => setLite(e.target.checked)} />
              Lite Mode
            </label>
          </div>
        </div>
      </aside>
    </div>
  )
}
