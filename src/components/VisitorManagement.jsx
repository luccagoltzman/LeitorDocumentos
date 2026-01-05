import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { visitantesAPI } from '../services/api'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Badge from './ui/Badge'
import { formatCPF, formatDate } from '../utils/formatters'
import FaceCapture from './FaceCapture'
import './VisitorManagement.css'

function VisitorManagement({ visitante, onClose, onUpdate }) {
  const { recarregarVisitantes } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    nome: visitante.nome || '',
    dataNascimento: visitante.dataNascimento ? formatDate(visitante.dataNascimento, 'YYYY-MM-DD') : '',
    cpf: visitante.cpf || ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      nome: visitante.nome || '',
      dataNascimento: visitante.dataNascimento ? formatDate(visitante.dataNascimento, 'YYYY-MM-DD') : '',
      cpf: visitante.cpf || ''
    })
    setError(null)
  }

  const handleSave = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Validar dados
      if (!formData.nome || formData.nome.trim().length < 3) {
        throw new Error('Nome deve ter pelo menos 3 caracteres')
      }

      const updateData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.replace(/\D/g, '')
      }

      // Validar e adicionar data de nascimento se fornecida
      if (formData.dataNascimento) {
        const data = new Date(formData.dataNascimento)
        if (!isNaN(data.getTime())) {
          updateData.dataNascimento = formData.dataNascimento
        }
      }

      const response = await visitantesAPI.atualizar(visitante.id, updateData)
      
      if (response.data) {
        await recarregarVisitantes()
        onUpdate?.(response.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Erro ao atualizar visitante:', error)
      setError(error.message || 'Erro ao atualizar visitante')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o visitante "${visitante.nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await visitantesAPI.remover(visitante.id)
      await recarregarVisitantes()
      onClose?.()
    } catch (error) {
      console.error('Erro ao excluir visitante:', error)
      setError(error.message || 'Erro ao excluir visitante')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdatePhoto = async (photo) => {
    setIsUpdatingPhoto(true)
    setError(null)

    try {
      const response = await visitantesAPI.atualizarFoto(visitante.id, photo)
      
      if (response.data) {
        await recarregarVisitantes()
        onUpdate?.(response.data)
        setIsUpdatingPhoto(false)
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error)
      setError(error.message || 'Erro ao atualizar foto')
      setIsUpdatingPhoto(false)
    }
  }

  const handlePhotoCancel = () => {
    setIsUpdatingPhoto(false)
    setError(null)
  }

  if (isUpdatingPhoto) {
    return (
      <Card 
        title="Atualizar Foto" 
        subtitle="Capture uma nova foto do visitante"
        className="visitor-management"
      >
        <FaceCapture
          onCapture={handleUpdatePhoto}
          onCancel={handlePhotoCancel}
        />
        {error && (
          <div className="error-message">{error}</div>
        )}
      </Card>
    )
  }

  return (
    <Card 
      title="Gerenciar Visitante" 
      subtitle={visitante.nome}
      className="visitor-management"
    >
      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="visitor-info-section">
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

        {isEditing ? (
          <div className="edit-form">
            <Input
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              fullWidth
              disabled={isProcessing}
            />

            <Input
              type="date"
              label="Data de Nascimento"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
              fullWidth
              disabled={isProcessing}
            />

            <Input
              label="CPF"
              value={formatCPF(formData.cpf)}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') })}
              fullWidth
              disabled={isProcessing}
            />

            <div className="form-actions">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isProcessing}
              >
                {isProcessing ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="view-mode">
            <div className="info-item">
              <span className="info-label">Nome:</span>
              <span className="info-value">{visitante.nome}</span>
            </div>

            <div className="info-item">
              <span className="info-label">CPF:</span>
              <span className="info-value">{formatCPF(visitante.cpf)}</span>
            </div>

            {visitante.dataNascimento && (
              <div className="info-item">
                <span className="info-label">Data de Nascimento:</span>
                <span className="info-value">{formatDate(visitante.dataNascimento)}</span>
              </div>
            )}

            <div className="info-item">
              <span className="info-label">Status:</span>
              <Badge variant={visitante.status === 'DENTRO' || visitante.status === 'dentro' ? 'success' : 'secondary'}>
                {visitante.status || 'Cadastrado'}
              </Badge>
            </div>

            {visitante.totalVisitas !== undefined && (
              <div className="info-item">
                <span className="info-label">Total de Visitas:</span>
                <span className="info-value">{visitante.totalVisitas}</span>
              </div>
            )}

            {visitante.dataCadastro && (
              <div className="info-item">
                <span className="info-label">Data de Cadastro:</span>
                <span className="info-value">{formatDate(visitante.dataCadastro)}</span>
              </div>
            )}

            <div className="action-buttons">
              <Button
                variant="secondary"
                onClick={() => setIsUpdatingPhoto(true)}
                disabled={isProcessing}
              >
                Atualizar Foto
              </Button>
              <Button
                variant="primary"
                onClick={handleEdit}
                disabled={isProcessing}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isProcessing || isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="card-actions">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isProcessing}
        >
          Fechar
        </Button>
      </div>
    </Card>
  )
}

export default VisitorManagement
