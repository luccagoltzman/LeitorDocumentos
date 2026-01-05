/**
 * Utilitários para persistência no localStorage
 */

const STORAGE_KEYS = {
  VISITANTES: 'portaria_visitantes',
  MORADORES: 'portaria_moradores',
  HISTORICO: 'portaria_historico',
  AGENDAMENTOS: 'portaria_agendamentos',
  PRESTADORES: 'portaria_prestadores',
  BLACKLIST: 'portaria_blacklist'
}

/**
 * Salva dados no localStorage
 */
export const saveToStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data)
    localStorage.setItem(key, serialized)
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error)
  }
}

/**
 * Carrega dados do localStorage
 */
export const loadFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item)
  } catch (error) {
    console.error(`Erro ao carregar ${key} do localStorage:`, error)
    return defaultValue
  }
}

/**
 * Limpa dados do localStorage
 */
export const clearStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Erro ao limpar ${key} do localStorage:`, error)
  }
}

/**
 * Limpa todo o storage da aplicação
 */
export const clearAllStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    clearStorage(key)
  })
}

export { STORAGE_KEYS }
