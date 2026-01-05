import { useState } from 'react'
import Button from './ui/Button'
import './Layout.css'

function Layout({ children, currentView, onViewChange }) {
  const views = [
    { id: 'scanner', label: 'Escanear Documento', icon: '📄' },
    { id: 'visitors', label: 'Visitantes', icon: '👥' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'history', label: 'Histórico', icon: '📋' },
    { id: 'search', label: 'Buscar', icon: '🔍' },
    { id: 'scheduling', label: 'Agendamentos', icon: '📅' },
    { id: 'qrcode', label: 'QR Code', icon: '🔲' }
  ]

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Portaria Digital</h2>
        </div>
        <div className="sidebar-nav">
          {views.map(view => (
            <button
              key={view.id}
              className={`nav-item ${currentView === view.id ? 'active' : ''}`}
              onClick={() => onViewChange(view.id)}
            >
              <span className="nav-icon">{view.icon}</span>
              <span className="nav-label">{view.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
