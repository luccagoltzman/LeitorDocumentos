import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Input from './ui/Input'
import Select from './ui/Select'
import Button from './ui/Button'
import Badge from './ui/Badge'
import VisitorManagement from './VisitorManagement'
import { formatCPF, formatDateOnly, formatDateTime } from '../utils/formatters'
import './VisitorsList.css'

function VisitorsList({ onSelectVisitor }) {
  const { visitantes, historico } = useApp()
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  })

  const filteredVisitors = useMemo(() => {
    return visitantes.filter(visitante => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = visitante.nome?.toLowerCase().includes(searchLower)
        const matchesCPF = visitante.cpf?.includes(filters.search)
        if (!matchesName && !matchesCPF) return false
      }

      // Filtro de status
      if (filters.status !== 'all' && visitante.status !== filters.status) {
        return false
      }

      return true
    }).sort((a, b) => {
      // Ordenar por data de cadastro (mais recentes primeiro)
      return new Date(b.dataCadastro) - new Date(a.dataCadastro)
    })
  }, [visitantes, filters])

  const getVisitorStats = (visitanteId) => {
    const registros = historico.filter(r => r.visitanteId === visitanteId)
    const totalVisitas = registros.length
    const ultimaVisita = registros.length > 0 
      ? registros.sort((a, b) => new Date(b.dataEntrada) - new Date(a.dataEntrada))[0]
      : null
    
    return { totalVisitas, ultimaVisita }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  if (selectedVisitor) {
    return (
      <VisitorManagement
        visitante={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
        onUpdate={(updated) => {
          setSelectedVisitor(updated)
          if (onSelectVisitor) {
            onSelectVisitor(updated)
          }
        }}
      />
    )
  }

  return (
    <Card title="Visitantes Cadastrados" className="visitors-list">
      <div className="list-header">
        <div className="list-filters">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            fullWidth
          />
          
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[
              { value: 'all', label: 'Todos os status' },
              { value: 'cadastrado', label: 'Cadastrado' },
              { value: 'dentro', label: 'Dentro' },
              { value: 'fora', label: 'Fora' }
            ]}
            fullWidth
          />
        </div>

        <div className="list-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{filteredVisitors.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dentro</span>
            <span className="stat-value">{filteredVisitors.filter(v => v.status === 'dentro').length}</span>
          </div>
        </div>
      </div>

      <div className="visitors-grid">
        {filteredVisitors.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum visitante encontrado</p>
          </div>
        ) : (
          filteredVisitors.map(visitante => {
            const stats = getVisitorStats(visitante.id)
            const statusVariant = {
              'cadastrado': 'default',
              'dentro': 'success',
              'fora': 'info'
            }[visitante.status] || 'default'

            return (
              <div key={visitante.id} className="visitor-card">
                {visitante.foto && (
                  <div className="visitor-photo">
                    <img 
                      src={visitante.foto.startsWith('http') ? visitante.foto : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${visitante.foto}`} 
                      alt={visitante.nome}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="visitor-info">
                  <div className="visitor-header">
                    <h3 className="visitor-name">{visitante.nome}</h3>
                    <Badge variant={statusVariant}>
                      {visitante.status === 'dentro' ? 'Dentro' : 
                       visitante.status === 'fora' ? 'Fora' : 'Cadastrado'}
                    </Badge>
                  </div>

                  <div className="visitor-details">
                    <div className="detail-row">
                      <span className="detail-label">CPF:</span>
                      <span className="detail-value">{formatCPF(visitante.cpf)}</span>
                    </div>
                    
                    {visitante.dataNascimento && (
                      <div className="detail-row">
                        <span className="detail-label">Nascimento:</span>
                        <span className="detail-value">{visitante.dataNascimento}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="detail-label">Total de visitas:</span>
                      <span className="detail-value">{stats.totalVisitas}</span>
                    </div>

                    {stats.ultimaVisita && (
                      <div className="detail-row">
                        <span className="detail-label">Última visita:</span>
                        <span className="detail-value">{formatDateOnly(stats.ultimaVisita.dataEntrada)}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="detail-label">Cadastrado em:</span>
                      <span className="detail-value">{formatDateOnly(visitante.dataCadastro)}</span>
                    </div>
                  </div>
                </div>

                <div className="visitor-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedVisitor(visitante)}
                  >
                    Gerenciar
                  </Button>
                  {onSelectVisitor && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectVisitor(visitante)}
                    >
                      Selecionar
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

export default VisitorsList
