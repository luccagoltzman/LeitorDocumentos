import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { visitantesAPI } from '../services/api'
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
    const checkData = async () => {
      if (extractedData?.cpf) {
        // Verificar se pessoa já existe
        const pessoa = buscarPorCPF(extractedData.cpf)
        if (pessoa) {
          setExistingPerson(pessoa)
        }

        // Verificar blacklist
        const naBlacklist = await verificarBlacklist(extractedData.cpf)
        if (naBlacklist) {
          setIsBlacklisted(true)
        }
      }
    }
    
    checkData()
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
        tipo: 'visita'
      }

      try {
        const novoVisitante = await adicionarVisitante(visitante, extractedData?.foto || null)
        
        if (novoVisitante) {
          onComplete?.(novoVisitante)
        }
      } catch (createError) {
        // Se o erro foi tratado internamente (fallback para criar novo), não mostrar erro
        // O sistema já tentou criar um novo cadastro automaticamente
        if (createError.status === 500 || createError.status === 404) {
          console.log('Erro tratado internamente, sistema tentou criar novo cadastro')
          // Tentar buscar o visitante criado
          try {
            const cpfLimpo = visitante.cpf.replace(/\D/g, '')
            const buscaResponse = await visitantesAPI.buscarPorCPF(cpfLimpo)
            if (buscaResponse.data) {
              onComplete?.(buscaResponse.data)
              return
            }
          } catch (searchError) {
            console.error('Erro ao buscar visitante após fallback:', searchError)
          }
        }
        throw createError
      }
    } catch (error) {
      console.error('Erro ao cadastrar visitante:', error)
      
      // Se o erro foi 500 ou 404, o sistema já tentou criar um novo visitante como fallback
      // Tentar buscar o visitante que pode ter sido criado
      if (error.status === 500 || error.status === 404) {
        try {
          const cpfLimpo = visitante.cpf.replace(/\D/g, '')
          const buscaResponse = await visitantesAPI.buscarPorCPF(cpfLimpo)
          if (buscaResponse.data) {
            // Visitante foi criado pelo fallback, continuar normalmente
            console.log('Visitante criado com sucesso pelo fallback')
            onComplete?.(buscaResponse.data)
            return
          }
        } catch (searchError) {
          console.error('Erro ao buscar visitante após fallback:', searchError)
        }
      }
      
      // Mostrar mensagem de erro mais detalhada
      let errorMessage = 'Erro ao cadastrar visitante. Tente novamente.'
      
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
        errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.'
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor. Verifique os dados e tente novamente. Se o problema persistir, entre em contato com o suporte.'
      }
      
      alert(errorMessage)
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
