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
 * Ou formata Date/ISO string para formato especificado
 */
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return ''
  
  // Se for string de data simples (15072000)
  if (typeof date === 'string' && /^\d+$/.test(date.replace(/\D/g, ''))) {
    const cleaned = date.replace(/\D/g, '')
    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
    }
    return date
  }
  
  // Se for Date object ou ISO string
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return date
    }
    
    if (format === 'YYYY-MM-DD') {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    // Formato padrão: dd/MM/yyyy
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj)
  } catch (error) {
    return date
  }
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
