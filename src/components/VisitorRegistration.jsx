import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { formatCPF, cleanCPF, formatDate } from '../utils/formatters'
import './VisitorRegistration.css'

function VisitorRegistration({ extractedData, onComplete, onCancel }) {
  const { adicionarVisitante, buscarPorCPF, verificarBlacklist } = useApp()
  const [existingPerson, setExistingPerson] = useState(null)
  const [isBlacklisted, setIsBlacklisted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (extractedData?.cpf) {
      // Verificar se pessoa já existe
      const pessoa = buscarPorCPF(extractedData.cpf)
      if (pessoa) {
        setExistingPerson(pessoa)
      }

      // Verificar blacklist
      if (verificarBlacklist(extractedData.cpf)) {
        setIsBlacklisted(true)
      }
    }
  }, [extractedData, buscarPorCPF, verificarBlacklist])

  const validateData = () => {
    if (!extractedData) return false
    
    const cpfLimpo = cleanCPF(extractedData.cpf || '')
    if (!extractedData.nome || extractedData.nome.trim().length < 3) {
      return false
    }
    if (cpfLimpo.length !== 11) {
      return false
    }
    return true
  }

  const handleConfirm = async () => {
    if (!validateData()) {
      alert('Dados inválidos. Por favor, escaneie o documento novamente.')
      return
    }

    if (isBlacklisted) {
      return
    }

    setIsProcessing(true)
    
    try {
      const visitante = {
        nome: extractedData.nome,
        cpf: cleanCPF(extractedData.cpf),
        dataNascimento: extractedData.dataNascimento || null,
        tipo: 'visita',
        foto: extractedData?.foto || null // Foto facial capturada
      }

      const novoVisitante = adicionarVisitante(visitante)
      onComplete?.(novoVisitante)
    } catch (error) {
      console.error('Erro ao cadastrar visitante:', error)
      alert('Erro ao cadastrar visitante. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isBlacklisted) {
    return (
      <Card title="Acesso Bloqueado" className="visitor-registration">
        <div className="blacklist-warning">
          <p>Esta pessoa está na lista de bloqueio e não pode ter acesso ao prédio.</p>
          <Button onClick={onCancel} variant="secondary" fullWidth>
            Voltar
          </Button>
        </div>
      </Card>
    )
  }

  if (!extractedData || !validateData()) {
    return (
      <Card title="Dados Insuficientes" className="visitor-registration">
        <div className="data-warning">
          <p>Não foi possível extrair os dados necessários do documento.</p>
          <p className="hint">Por favor, escaneie o documento novamente.</p>
          <Button onClick={onCancel} variant="secondary" fullWidth>
            Voltar
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="Confirmar Dados do Visitante" 
      subtitle={existingPerson ? "Visitante já cadastrado. Confirmar entrada?" : "Confirme os dados extraídos do documento"}
      className="visitor-registration"
    >
      <div className="extracted-data-display">
        <div className="data-item">
          <span className="data-label">Nome:</span>
          <span className="data-value">{extractedData.nome || 'Não encontrado'}</span>
        </div>

        <div className="data-item">
          <span className="data-label">CPF:</span>
          <span className="data-value">{formatCPF(extractedData.cpf) || 'Não encontrado'}</span>
        </div>

        {extractedData.dataNascimento && (
          <div className="data-item">
            <span className="data-label">Data de Nascimento:</span>
            <span className="data-value">{formatDate(extractedData.dataNascimento)}</span>
          </div>
        )}

        {existingPerson && (
          <div className="existing-person-badge">
            <Badge variant="info">Visitante já cadastrado anteriormente</Badge>
          </div>
        )}
      </div>

      <div className="form-actions">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancelar
        </Button>
        <Button 
          type="button" 
          variant="primary"
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? 'Cadastrando...' : 'Confirmar e Registrar Entrada'}
        </Button>
      </div>
    </Card>
  )
}

export default VisitorRegistration
