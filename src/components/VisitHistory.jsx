import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Input from './ui/Input'
import Select from './ui/Select'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { formatDateTime, formatTime, getTimeAgo } from '../utils/formatters'
import './VisitHistory.css'

function VisitHistory() {
  const { historico, visitantes, registrarSaida } = useApp()
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    tipo: 'all',
    dateFrom: '',
    dateTo: ''
  })

  const filteredHistory = useMemo(() => {
    return historico.filter(registro => {
      const visitante = visitantes.find(v => v.id === registro.visitanteId)
      
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = visitante?.nome?.toLowerCase().includes(searchLower)
        const matchesCPF = visitante?.cpf?.includes(filters.search)
        const matchesApt = registro.apartamento?.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesCPF && !matchesApt) return false
      }

      // Filtro de status
      if (filters.status !== 'all' && registro.status !== filters.status) {
        return false
      }

      // Filtro de tipo
      if (filters.tipo !== 'all' && registro.tipo !== filters.tipo) {
        return false
      }

      // Filtro de data
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom)
        const registroDate = new Date(registro.dataEntrada)
        if (registroDate < dateFrom) return false
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo)
        dateTo.setHours(23, 59, 59)
        const registroDate = new Date(registro.dataEntrada)
        if (registroDate > dateTo) return false
      }

      return true
    })
  }, [historico, visitantes, filters])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleSaida = (registroId) => {
    if (window.confirm('Deseja registrar a saída deste visitante?')) {
      registrarSaida(registroId)
    }
  }

  const getVisitanteNome = (visitanteId) => {
    const visitante = visitantes.find(v => v.id === visitanteId)
    return visitante?.nome || 'Desconhecido'
  }

  return (
    <Card title="Histórico de Visitas" className="visit-history">
      <div className="history-filters">
        <Input
          placeholder="Buscar por nome, CPF ou apartamento..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          fullWidth
        />
        
        <div className="filters-row">
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[
              { value: 'all', label: 'Todos os status' },
              { value: 'dentro', label: 'Dentro' },
              { value: 'fora', label: 'Fora' }
            ]}
            fullWidth
          />

          <Select
            value={filters.tipo}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            options={[
              { value: 'all', label: 'Todos os tipos' },
              { value: 'visita', label: 'Visita' },
              { value: 'entrega', label: 'Entrega' },
              { value: 'prestador', label: 'Prestador' },
              { value: 'outro', label: 'Outro' }
            ]}
            fullWidth
          />
        </div>

        <div className="filters-row">
          <Input
            type="date"
            label="Data inicial"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            fullWidth
          />
          <Input
            type="date"
            label="Data final"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            fullWidth
          />
        </div>
      </div>

      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-label">Total de registros</span>
          <span className="stat-value">{filteredHistory.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dentro agora</span>
          <span className="stat-value">{filteredHistory.filter(h => h.status === 'dentro').length}</span>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum registro encontrado</p>
          </div>
        ) : (
          filteredHistory.map(registro => (
            <div key={registro.id} className="history-item">
              <div className="history-item-header">
                <div>
                  <h4 className="history-item-name">{getVisitanteNome(registro.visitanteId)}</h4>
                  <p className="history-item-time">{formatDateTime(registro.dataEntrada)}</p>
                </div>
                <div className="history-item-badges">
                  <Badge variant={registro.status === 'dentro' ? 'success' : 'default'}>
                    {registro.status === 'dentro' ? 'Dentro' : 'Fora'}
                  </Badge>
                  <Badge variant="info">{registro.tipo}</Badge>
                </div>
              </div>

              <div className="history-item-details">
                {registro.apartamento && (
                  <div className="detail-item">
                    <span className="detail-label">Apartamento:</span>
                    <span className="detail-value">{registro.apartamento}</span>
                  </div>
                )}
                {registro.dataSaida && (
                  <div className="detail-item">
                    <span className="detail-label">Saída:</span>
                    <span className="detail-value">{formatDateTime(registro.dataSaida)}</span>
                  </div>
                )}
                {registro.observacoes && (
                  <div className="detail-item">
                    <span className="detail-label">Observações:</span>
                    <span className="detail-value">{registro.observacoes}</span>
                  </div>
                )}
              </div>

              {registro.status === 'dentro' && (
                <div className="history-item-actions">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleSaida(registro.id)}
                  >
                    Registrar Saída
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

export default VisitHistory
