import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { formatDateTime, formatTime } from '../utils/formatters'
import './EntryControl.css'

function EntryControl({ visitante, onComplete }) {
  const { registrarEntrada, registrarSaida, historico } = useApp()
  const [isProcessing, setIsProcessing] = useState(false)

  // Verificar se visitante está dentro
  const registroAtivo = historico.find(
    r => r.visitanteId === visitante.id && r.status === 'dentro'
  )

  const handleEntrada = async () => {
    setIsProcessing(true)
    try {
      const dados = {
        tipo: visitante.tipo || 'visita',
        apartamento: visitante.apartamento || '',
        foto: visitante.foto || null,
        observacoes: visitante.observacoes || ''
      }
      
      const registro = registrarEntrada(visitante.id, dados)
      onComplete?.(registro)
    } catch (error) {
      console.error('Erro ao registrar entrada:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaida = async () => {
    if (!registroAtivo) return
    
    setIsProcessing(true)
    try {
      registrarSaida(registroAtivo.id)
      onComplete?.({ tipo: 'saida' })
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card 
      title="Controle de Acesso"
      subtitle={visitante.nome}
      className="entry-control"
    >
      <div className="entry-info">
        <div className="info-row">
          <span className="info-label">CPF:</span>
          <span className="info-value">{visitante.cpf}</span>
        </div>
        {visitante.apartamento && (
          <div className="info-row">
            <span className="info-label">Apartamento:</span>
            <span className="info-value">{visitante.apartamento}</span>
          </div>
        )}
        {visitante.tipo && (
          <div className="info-row">
            <span className="info-label">Tipo:</span>
            <Badge variant="info">{visitante.tipo}</Badge>
          </div>
        )}
        {registroAtivo && (
          <div className="info-row">
            <span className="info-label">Entrada:</span>
            <span className="info-value">{formatTime(registroAtivo.dataEntrada)}</span>
          </div>
        )}
      </div>

      <div className="entry-actions">
        {registroAtivo ? (
          <>
            <Badge variant="success" size="lg">Dentro do Condomínio</Badge>
            <Button
              variant="danger"
              size="lg"
              fullWidth
              onClick={handleSaida}
              disabled={isProcessing}
            >
              {isProcessing ? 'Registrando...' : 'Registrar Saída'}
            </Button>
          </>
        ) : (
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={handleEntrada}
            disabled={isProcessing}
          >
            {isProcessing ? 'Registrando...' : 'Registrar Entrada'}
          </Button>
        )}
      </div>
    </Card>
  )
}

export default EntryControl
