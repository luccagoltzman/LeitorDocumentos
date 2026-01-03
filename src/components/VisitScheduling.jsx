import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Input from './ui/Input'
import Select from './ui/Select'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { formatDateTime, formatDateOnly } from '../utils/formatters'
import './VisitScheduling.css'

function VisitScheduling() {
  const { agendamentos, adicionarAgendamento, moradores } = useApp()
  const [formData, setFormData] = useState({
    nomeVisitante: '',
    cpfVisitante: '',
    telefone: '',
    apartamento: '',
    moradorId: '',
    dataAgendamento: '',
    horaAgendamento: '',
    tipo: 'visita',
    observacoes: ''
  })
  const [errors, setErrors] = useState({})
  const [showForm, setShowForm] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nomeVisitante || formData.nomeVisitante.trim().length < 3) {
      newErrors.nomeVisitante = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!formData.apartamento) {
      newErrors.apartamento = 'Informe o apartamento/unidade'
    }

    if (!formData.dataAgendamento) {
      newErrors.dataAgendamento = 'Informe a data do agendamento'
    }

    if (!formData.horaAgendamento) {
      newErrors.horaAgendamento = 'Informe o horário do agendamento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) return

    const agendamento = {
      ...formData,
      dataHora: `${formData.dataAgendamento}T${formData.horaAgendamento}:00`
    }

    adicionarAgendamento(agendamento)
    setFormData({
      nomeVisitante: '',
      cpfVisitante: '',
      telefone: '',
      apartamento: '',
      moradorId: '',
      dataAgendamento: '',
      horaAgendamento: '',
      tipo: 'visita',
      observacoes: ''
    })
    setShowForm(false)
    setErrors({})
  }

  const agendamentosHoje = agendamentos.filter(a => {
    const hoje = new Date().toISOString().split('T')[0]
    return a.dataHora?.startsWith(hoje) && a.status === 'pendente'
  })

  const agendamentosFuturos = agendamentos
    .filter(a => {
      const dataAgendamento = new Date(a.dataHora)
      const agora = new Date()
      return dataAgendamento > agora && a.status === 'pendente'
    })
    .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))

  return (
    <Card 
      title="Agendamento de Visitas"
      actions={
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Novo Agendamento'}
        </Button>
      }
      className="visit-scheduling"
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="scheduling-form">
          <Input
            label="Nome do Visitante"
            value={formData.nomeVisitante}
            onChange={(e) => handleChange('nomeVisitante', e.target.value)}
            error={errors.nomeVisitante}
            fullWidth
            required
          />

          <div className="form-row">
            <Input
              label="CPF (opcional)"
              value={formData.cpfVisitante}
              onChange={(e) => handleChange('cpfVisitante', e.target.value)}
              placeholder="000.000.000-00"
              fullWidth
            />

            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              fullWidth
            />
          </div>

          <Input
            label="Apartamento/Unidade"
            value={formData.apartamento}
            onChange={(e) => handleChange('apartamento', e.target.value)}
            error={errors.apartamento}
            fullWidth
            required
          />

          <div className="form-row">
            <Input
              type="date"
              label="Data do Agendamento"
              value={formData.dataAgendamento}
              onChange={(e) => handleChange('dataAgendamento', e.target.value)}
              error={errors.dataAgendamento}
              fullWidth
              required
            />

            <Input
              type="time"
              label="Horário"
              value={formData.horaAgendamento}
              onChange={(e) => handleChange('horaAgendamento', e.target.value)}
              error={errors.horaAgendamento}
              fullWidth
              required
            />
          </div>

          <Select
            label="Tipo de Visita"
            value={formData.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            options={[
              { value: 'visita', label: 'Visita' },
              { value: 'entrega', label: 'Entrega' },
              { value: 'prestador', label: 'Prestador de Serviço' }
            ]}
            fullWidth
          />

          <Input
            label="Observações"
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Informações adicionais (opcional)"
            fullWidth
          />

          <div className="form-actions">
            <Button type="submit" variant="primary" fullWidth>
              Agendar Visita
            </Button>
          </div>
        </form>
      )}

      <div className="scheduling-lists">
        {agendamentosHoje.length > 0 && (
          <div className="scheduling-section">
            <h3 className="section-title">Agendamentos de Hoje</h3>
            <div className="agendamentos-list">
              {agendamentosHoje.map(agendamento => (
                <div key={agendamento.id} className="agendamento-item">
                  <div className="agendamento-info">
                    <h4>{agendamento.nomeVisitante}</h4>
                    <p className="agendamento-time">{formatDateTime(agendamento.dataHora)}</p>
                    <p className="agendamento-apt">Apto: {agendamento.apartamento}</p>
                  </div>
                  <Badge variant="warning">{agendamento.tipo}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="scheduling-section">
          <h3 className="section-title">Próximos Agendamentos</h3>
          {agendamentosFuturos.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum agendamento futuro</p>
            </div>
          ) : (
            <div className="agendamentos-list">
              {agendamentosFuturos.map(agendamento => (
                <div key={agendamento.id} className="agendamento-item">
                  <div className="agendamento-info">
                    <h4>{agendamento.nomeVisitante}</h4>
                    <p className="agendamento-time">{formatDateTime(agendamento.dataHora)}</p>
                    <p className="agendamento-apt">Apto: {agendamento.apartamento}</p>
                  </div>
                  <Badge variant="info">{agendamento.tipo}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default VisitScheduling
