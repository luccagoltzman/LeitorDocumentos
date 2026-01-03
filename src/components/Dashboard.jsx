import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Badge from './ui/Badge'
import { formatDateOnly } from '../utils/formatters'
import './Dashboard.css'

function Dashboard() {
  const { obterEstatisticas, historico, visitantes } = useApp()
  const stats = obterEstatisticas()

  const visitasRecentes = historico.slice(0, 5)
  const visitantesFrequentes = stats.visitantesFrequentes

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral do sistema de portaria</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-icon stat-icon-primary">👥</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalVisitantes}</h3>
            <p className="stat-label">Visitantes Cadastrados</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-success">🏠</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalMoradores}</h3>
            <p className="stat-label">Moradores</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-warning">🔧</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalPrestadores}</h3>
            <p className="stat-label">Prestadores</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-info">📅</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.visitasHoje}</h3>
            <p className="stat-label">Visitas Hoje</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-danger">🚪</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.dentroAgora}</h3>
            <p className="stat-label">Dentro Agora</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-primary">📋</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalAgendamentos}</h3>
            <p className="stat-label">Agendamentos Pendentes</p>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="Visitas Recentes" className="dashboard-section">
          {visitasRecentes.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma visita registrada ainda</p>
            </div>
          ) : (
            <div className="recent-list">
              {visitasRecentes.map(visita => {
                const visitante = visitantes.find(v => v.id === visita.visitanteId)
                return (
                  <div key={visita.id} className="recent-item">
                    <div className="recent-item-info">
                      <h4>{visitante?.nome || 'Desconhecido'}</h4>
                      <p>{formatDateOnly(visita.dataEntrada)} - {visita.apartamento}</p>
                    </div>
                    <Badge variant={visita.status === 'dentro' ? 'success' : 'default'}>
                      {visita.status === 'dentro' ? 'Dentro' : 'Fora'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card title="Visitantes Mais Frequentes" className="dashboard-section">
          {visitantesFrequentes.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum dado disponível</p>
            </div>
          ) : (
            <div className="frequent-list">
              {visitantesFrequentes.map((visitante, index) => (
                <div key={visitante.id} className="frequent-item">
                  <div className="frequent-rank">#{index + 1}</div>
                  <div className="frequent-info">
                    <h4>{visitante.nome}</h4>
                    <p>{visitante.totalVisitas || 0} visita(s)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
