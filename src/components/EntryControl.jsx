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
    if (!visitante?.id) {
      alert('Erro: Visitante não identificado. Por favor, tente novamente.')
      return
    }

    setIsProcessing(true)
    try {
      const dados = {
        sala: visitante.sala || null,
        // Não enviar foto se for URL (já está salva no servidor)
        foto: visitante.foto && !visitante.foto.startsWith('http') && !visitante.foto.startsWith('/') ? visitante.foto : null
      }
      
      console.log('Dados sendo enviados:', { visitanteId: visitante.id, dados })
      
      const registro = await registrarEntrada(visitante.id, dados)
      onComplete?.(registro)
    } catch (error) {
      console.error('Erro ao registrar entrada:', error)
      
      // Mostrar mensagem de erro mais detalhada
      let errorMessage = 'Erro ao registrar entrada. Tente novamente.'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.data?.error?.message) {
        errorMessage = error.data.error.message
      } else if (error.data?.message) {
        errorMessage = error.data.message
      }
      
      // Mensagens específicas para códigos de erro comuns
      if (error.code === 'UNAUTHORIZED') {
        errorMessage = 'Sessão expirada. Por favor, faça login novamente.'
      } else if (error.status === 400) {
        errorMessage = 'Dados inválidos. Verifique se o visitante está cadastrado e tente novamente.'
      } else if (error.status === 404) {
        errorMessage = 'Visitante não encontrado. Por favor, cadastre o visitante primeiro.'
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor. Tente novamente. Se o problema persistir, entre em contato com o suporte.'
      }
      
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaida = async () => {
    if (!registroAtivo) return
    
    setIsProcessing(true)
    try {
      await registrarSaida(registroAtivo.id)
      onComplete?.({ tipo: 'saida' })
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
      alert('Erro ao registrar saída. Tente novamente.')
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
        {visitante.dataNascimento && (
          <div className="info-row">
            <span className="info-label">Data de Nascimento:</span>
            <span className="info-value">{visitante.dataNascimento}</span>
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
            <Badge variant="success" size="lg">Dentro do Prédio</Badge>
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
