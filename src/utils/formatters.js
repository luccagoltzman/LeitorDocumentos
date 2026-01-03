/**
 * Formata CPF: 12345678901 -> 123.456.789-01
 */
export const formatCPF = (cpf) => {
  if (!cpf) return ''
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cpf
}

/**
 * Remove formatação do CPF
 */
export const cleanCPF = (cpf) => {
  if (!cpf) return ''
  return cpf.replace(/\D/g, '')
}

/**
 * Valida CPF básico (formato)
 */
export const isValidCPFFormat = (cpf) => {
  const cleaned = cleanCPF(cpf)
  return cleaned.length === 11 && /^\d+$/.test(cleaned)
}

/**
 * Formata data: 15072000 -> 15/07/2000
 */
export const formatDate = (date) => {
  if (!date) return ''
  const cleaned = date.replace(/\D/g, '')
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
  }
  return date
}

/**
 * Formata data/hora para exibição
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Formata apenas data para exibição
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

/**
 * Formata apenas hora para exibição
 */
export const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Calcula tempo decorrido de forma humanizada
 */
export const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'agora'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`
  
  return formatDateOnly(dateString)
}
