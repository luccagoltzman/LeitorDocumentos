import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Input from './ui/Input'
import Select from './ui/Select'
import Button from './ui/Button'
import { formatCPF, cleanCPF } from '../utils/formatters'
import './VisitorRegistration.css'

function VisitorRegistration({ extractedData, onComplete, onCancel }) {
  const { adicionarVisitante, buscarPorCPF, verificarBlacklist } = useApp()
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    tipo: 'visita',
    apartamento: '',
    observacoes: ''
  })
  const [errors, setErrors] = useState({})
  const [existingPerson, setExistingPerson] = useState(null)
  const [isBlacklisted, setIsBlacklisted] = useState(false)

  useEffect(() => {
    if (extractedData) {
      setFormData(prev => ({
        ...prev,
        nome: extractedData.nome || '',
        cpf: extractedData.cpf || '',
        dataNascimento: extractedData.dataNascimento || ''
      }))

      // Verificar se pessoa já existe
      if (extractedData.cpf) {
        const pessoa = buscarPorCPF(extractedData.cpf)
        if (pessoa) {
          setExistingPerson(pessoa)
        }

        // Verificar blacklist
        if (verificarBlacklist(extractedData.cpf)) {
          setIsBlacklisted(true)
        }
      }
    }
  }, [extractedData, buscarPorCPF, verificarBlacklist])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleCPFChange = (value) => {
    const cleaned = cleanCPF(value)
    const formatted = formatCPF(cleaned)
    handleChange('cpf', formatted)
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nome || formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!formData.cpf || cleanCPF(formData.cpf).length !== 11) {
      newErrors.cpf = 'CPF inválido'
    }

    if (isBlacklisted) {
      newErrors.cpf = 'Esta pessoa está na lista de bloqueio'
    }

    if (formData.tipo === 'visita' && !formData.apartamento) {
      newErrors.apartamento = 'Informe o apartamento/unidade'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) return

    const visitante = {
      ...formData,
      cpf: cleanCPF(formData.cpf),
      foto: extractedData?.foto || null
    }

    adicionarVisitante(visitante)
    onComplete?.(visitante)
  }

  if (isBlacklisted) {
    return (
      <Card title="Acesso Bloqueado" className="visitor-registration">
        <div className="blacklist-warning">
          <p>Esta pessoa está na lista de bloqueio e não pode ter acesso ao condomínio.</p>
          <Button onClick={onCancel} variant="secondary">
            Voltar
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="Cadastrar Visitante" 
      subtitle={existingPerson ? "Pessoa já cadastrada. Atualizando informações..." : "Preencha os dados para cadastrar"}
      className="visitor-registration"
    >
      <form onSubmit={handleSubmit} className="visitor-form">
        <Input
          label="Nome Completo"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          error={errors.nome}
          fullWidth
          required
        />

        <div className="form-row">
          <Input
            label="CPF"
            value={formData.cpf}
            onChange={(e) => handleCPFChange(e.target.value)}
            error={errors.cpf}
            placeholder="000.000.000-00"
            maxLength={14}
            fullWidth
            required
          />

          <Input
            label="Data de Nascimento"
            value={formData.dataNascimento}
            onChange={(e) => handleChange('dataNascimento', e.target.value)}
            placeholder="DD/MM/AAAA"
            fullWidth
          />
        </div>

        <Input
          label="Telefone"
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          placeholder="(00) 00000-0000"
          fullWidth
        />

        <Select
          label="Tipo de Visita"
          value={formData.tipo}
          onChange={(e) => handleChange('tipo', e.target.value)}
          options={[
            { value: 'visita', label: 'Visita' },
            { value: 'entrega', label: 'Entrega' },
            { value: 'prestador', label: 'Prestador de Serviço' },
            { value: 'outro', label: 'Outro' }
          ]}
          fullWidth
        />

        {formData.tipo === 'visita' && (
          <Input
            label="Apartamento/Unidade"
            value={formData.apartamento}
            onChange={(e) => handleChange('apartamento', e.target.value)}
            error={errors.apartamento}
            placeholder="Ex: 101, Bloco A"
            fullWidth
            required
          />
        )}

        <Input
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => handleChange('observacoes', e.target.value)}
          placeholder="Informações adicionais (opcional)"
          fullWidth
        />

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Cadastrar e Registrar Entrada
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default VisitorRegistration
