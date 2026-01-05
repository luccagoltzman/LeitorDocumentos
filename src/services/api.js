/**
 * Serviço de API para comunicação com o backend
 * 
 * IMPORTANTE: Configure a URL base da API nas variáveis de ambiente
 * ou ajuste a constante API_BASE_URL abaixo
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Função genérica para fazer requisições HTTP
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      // Se for erro 401 (não autorizado), limpar token e redirecionar para login
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        // Disparar evento para o App detectar e mostrar login
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
      
      let errorData
      try {
        errorData = await response.json()
      } catch {
        // Se não conseguir parsear JSON, tentar ler como texto
        const text = await response.text()
        errorData = { 
          message: text || `Erro ${response.status}`,
          code: response.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN'
        }
      }
      
      const errorMessage = errorData.error?.message || errorData.message || `Erro ${response.status}`
      const errorCode = errorData.error?.code || errorData.code || 'UNKNOWN'
      
      const error = new Error(errorMessage)
      error.code = errorCode
      error.status = response.status
      error.data = errorData
      
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error)
    
    // Se já é um erro criado por nós, apenas relançar
    if (error.code) {
      throw error
    }
    
    // Caso contrário, criar erro genérico
    const genericError = new Error(error.message || 'Erro na requisição')
    genericError.code = 'NETWORK_ERROR'
    throw genericError
  }
}

/**
 * Upload de arquivo (multipart/form-data)
 */
async function uploadFile(endpoint, formData, method = 'POST') {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('auth_token')
  
  const config = {
    method: method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        // Se não conseguir parsear JSON, tentar ler como texto
        const text = await response.text()
        errorData = { 
          message: text || `Erro ${response.status}`,
          code: response.status === 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN'
        }
      }
      
      const errorMessage = errorData.error?.message || errorData.message || `Erro ${response.status}`
      const errorCode = errorData.error?.code || errorData.code || 'UNKNOWN'
      
      const error = new Error(errorMessage)
      error.code = errorCode
      error.status = response.status
      error.data = errorData
      
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error(`Erro no upload ${endpoint}:`, error)
    
    // Se já é um erro criado por nós, apenas relançar
    if (error.code) {
      throw error
    }
    
    // Caso contrário, criar erro genérico
    const genericError = new Error(error.message || 'Erro ao fazer upload')
    genericError.code = 'NETWORK_ERROR'
    throw genericError
  }
}

// ==================== VISITANTES ====================

export const visitantesAPI = {
  /**
   * Lista todos os visitantes
   */
  listar: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return request(`/visitantes${queryParams ? `?${queryParams}` : ''}`)
  },

  /**
   * Busca visitante por ID
   */
  buscarPorId: async (id) => {
    return request(`/visitantes/${id}`)
  },

  /**
   * Busca visitante por CPF
   */
  buscarPorCPF: async (cpf) => {
    return request(`/visitantes/buscar/${cpf}`)
  },

  /**
   * Cria novo visitante
   */
  criar: async (visitante, foto) => {
    const formData = new FormData()
    
    formData.append('nome', visitante.nome)
    formData.append('cpf', visitante.cpf)
    if (visitante.dataNascimento) {
      formData.append('dataNascimento', visitante.dataNascimento)
    }
    if (foto) {
      // Converter base64 para blob se necessário
      if (foto.startsWith('data:')) {
        const response = await fetch(foto)
        const blob = await response.blob()
        formData.append('foto', blob, 'foto.jpg')
      } else {
        formData.append('foto', foto)
      }
    }

    return uploadFile('/visitantes', formData)
  },

  /**
   * Atualiza visitante existente
   */
  atualizar: async (id, visitante, foto = null) => {
    if (!id) {
      throw new Error('ID do visitante é obrigatório para atualização')
    }

    const formData = new FormData()
    
    if (visitante.nome) {
      formData.append('nome', visitante.nome.trim())
    }
    
    // Validar data de nascimento antes de enviar
    if (visitante.dataNascimento) {
      // Verificar se é uma data válida
      const data = new Date(visitante.dataNascimento)
      if (!isNaN(data.getTime())) {
        // Formatar como ISO string ou DD/MM/YYYY conforme backend espera
        formData.append('dataNascimento', visitante.dataNascimento)
      } else {
        console.warn('Data de nascimento inválida, não será enviada:', visitante.dataNascimento)
      }
    }
    
    if (visitante.cpf) {
      formData.append('cpf', visitante.cpf.replace(/\D/g, ''))
    }
    
    if (foto) {
      try {
        if (foto.startsWith('data:')) {
          const response = await fetch(foto)
          const blob = await response.blob()
          // Verificar se é uma imagem válida
          if (blob.type.startsWith('image/')) {
            formData.append('foto', blob, 'foto.jpg')
          } else {
            console.warn('Arquivo não é uma imagem válida')
          }
        } else if (foto instanceof File || foto instanceof Blob) {
          // Verificar se é uma imagem válida
          if (foto.type && foto.type.startsWith('image/')) {
            formData.append('foto', foto, 'foto.jpg')
          } else {
            console.warn('Arquivo não é uma imagem válida')
          }
        } else {
          // Se for string (URL ou path), tentar buscar
          const response = await fetch(foto)
          const blob = await response.blob()
          if (blob.type.startsWith('image/')) {
            formData.append('foto', blob, 'foto.jpg')
          } else {
            console.warn('Arquivo não é uma imagem válida')
          }
        }
      } catch (error) {
        console.warn('Erro ao processar foto, continuando sem foto:', error)
        // Continuar sem foto se houver erro
      }
    }

    // Usar uploadFile para FormData (já trata multipart/form-data corretamente)
    return uploadFile(`/visitantes/${id}`, formData, 'PUT')
  },

  /**
   * Remove visitante
   */
  remover: async (id) => {
    return request(`/visitantes/${id}`, { method: 'DELETE' })
  },

  /**
   * Atualiza apenas a foto do visitante
   */
  atualizarFoto: async (id, foto) => {
    if (!id) {
      throw new Error('ID do visitante é obrigatório')
    }

    const formData = new FormData()
    
    if (foto) {
      try {
        if (foto.startsWith('data:')) {
          const response = await fetch(foto)
          const blob = await response.blob()
          if (blob.type.startsWith('image/')) {
            formData.append('foto', blob, 'foto.jpg')
          } else {
            throw new Error('Arquivo não é uma imagem válida')
          }
        } else if (foto instanceof File || foto instanceof Blob) {
          if (foto.type && foto.type.startsWith('image/')) {
            formData.append('foto', foto, 'foto.jpg')
          } else {
            throw new Error('Arquivo não é uma imagem válida')
          }
        } else {
          const response = await fetch(foto)
          const blob = await response.blob()
          if (blob.type.startsWith('image/')) {
            formData.append('foto', blob, 'foto.jpg')
          } else {
            throw new Error('Arquivo não é uma imagem válida')
          }
        }
      } catch (error) {
        throw new Error(`Erro ao processar foto: ${error.message}`)
      }
    } else {
      throw new Error('Foto é obrigatória para atualização')
    }

    return uploadFile(`/visitantes/${id}/foto`, formData, 'PUT')
  }
}

// ==================== REGISTROS ====================

export const registrosAPI = {
  /**
   * Lista registros de entrada/saída
   */
  listar: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return request(`/registros${queryParams ? `?${queryParams}` : ''}`)
  },

  /**
   * Busca registro por ID
   */
  buscarPorId: async (id) => {
    return request(`/registros/${id}`)
  },

  /**
   * Registra entrada de visitante
   */
  registrarEntrada: async (visitanteId, dados, foto) => {
    const formData = new FormData()
    
    // visitanteId é obrigatório
    if (!visitanteId) {
      throw new Error('ID do visitante é obrigatório para registrar entrada')
    }
    
    formData.append('visitanteId', visitanteId)
    
    // Dados opcionais
    if (dados.sala) {
      formData.append('sala', dados.sala.trim())
    }
    
    // Tipo de registro deve ser 'ENTRADA' ou 'SAIDA', não 'visita'
    // 'visita' é o tipo do visitante, não do registro
    formData.append('tipo', 'ENTRADA') // Tipo de registro é sempre ENTRADA para este endpoint
    
    if (dados.observacoes) {
      formData.append('observacoes', dados.observacoes)
    }
    
    // Foto opcional
    if (foto) {
      try {
        // Verificar se é uma string (URL ou base64) ou um objeto File/Blob
        if (typeof foto === 'string') {
          if (foto.startsWith('data:')) {
            const response = await fetch(foto)
            const blob = await response.blob()
            // Verificar se é uma imagem válida
            if (blob.type.startsWith('image/')) {
              formData.append('foto', blob, 'foto.jpg')
            } else {
              console.warn('Arquivo não é uma imagem válida, não será enviado')
            }
          } else if (foto.startsWith('http://') || foto.startsWith('https://') || foto.startsWith('/')) {
            // É uma URL, não enviar como arquivo
            console.warn('Foto é uma URL, não será enviada no registro de entrada')
            // Não adicionar foto se for URL
          }
        } else if (foto instanceof File || foto instanceof Blob) {
          // Verificar se é uma imagem válida
          if (foto.type && foto.type.startsWith('image/')) {
            formData.append('foto', foto, 'foto.jpg')
          } else {
            console.warn('Arquivo não é uma imagem válida, não será enviado')
          }
        }
      } catch (error) {
        console.warn('Erro ao processar foto, continuando sem foto:', error)
        // Continuar sem foto se houver erro
      }
    }

    return uploadFile('/registros/entrada', formData)
  },

  /**
   * Registra saída de visitante
   */
  registrarSaida: async (registroId, observacoes = null) => {
    return request(`/registros/${registroId}/saida`, {
      method: 'PUT',
      body: JSON.stringify({ observacoes })
    })
  },

  /**
   * Obtém estatísticas
   */
  estatisticas: async (periodo = 'hoje') => {
    return request(`/registros/estatisticas?periodo=${periodo}`)
  }
}

// ==================== OCR ====================

export const ocrAPI = {
  /**
   * Processa imagem de documento e extrai dados
   */
  processar: async (imagem) => {
    const formData = new FormData()
    
    if (imagem.startsWith('data:')) {
      const response = await fetch(imagem)
      const blob = await response.blob()
      formData.append('imagem', blob, 'documento.jpg')
    } else {
      formData.append('imagem', imagem)
    }

    return uploadFile('/ocr/processar', formData)
  }
}

// ==================== BLACKLIST ====================

export const blacklistAPI = {
  /**
   * Lista blacklist
   */
  listar: async () => {
    return request('/blacklist')
  },

  /**
   * Adiciona à blacklist
   */
  adicionar: async (pessoa) => {
    return request('/blacklist', {
      method: 'POST',
      body: JSON.stringify(pessoa)
    })
  },

  /**
   * Remove da blacklist
   */
  remover: async (id) => {
    return request(`/blacklist/${id}`, { method: 'DELETE' })
  },

  /**
   * Verifica se CPF está na blacklist
   */
  verificar: async (cpf) => {
    return request(`/blacklist/verificar/${cpf}`)
  }
}

// ==================== AUTENTICAÇÃO ====================

export const authAPI = {
  /**
   * Login
   */
  login: async (email, senha) => {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    })
    
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    
    return response
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('auth_token')
  },

  /**
   * Refresh token
   */
  refresh: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) throw new Error('Token de refresh não encontrado')
    
    const response = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
    
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    
    return response
  }
}

export default {
  visitantes: visitantesAPI,
  registros: registrosAPI,
  ocr: ocrAPI,
  blacklist: blacklistAPI,
  auth: authAPI
}
