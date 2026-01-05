import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { visitantesAPI, registrosAPI, ocrAPI, blacklistAPI } from '../services/api'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  // Estado de visitantes
  const [visitantes, setVisitantes] = useState([])
  
  // Estado de moradores
  const [moradores, setMoradores] = useState([])
  
  // Estado de histórico de visitas
  const [historico, setHistorico] = useState([])
  
  // Estado de agendamentos
  const [agendamentos, setAgendamentos] = useState([])
  
  // Estado de prestadores
  const [prestadores, setPrestadores] = useState([])
  
  // Estado de blacklist
  const [blacklist, setBlacklist] = useState([])

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(false)

  // Carregar dados iniciais do backend
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true)
      try {
        // Carregar visitantes
        const visitantesResponse = await visitantesAPI.listar({ limit: 1000 })
        if (visitantesResponse.data) {
          setVisitantes(visitantesResponse.data)
        }

        // Carregar histórico
        const historicoResponse = await registrosAPI.listar({ limit: 1000 })
        if (historicoResponse.data) {
          setHistorico(historicoResponse.data)
        }

        // Carregar blacklist
        const blacklistResponse = await blacklistAPI.listar()
        if (blacklistResponse.data) {
          setBlacklist(blacklistResponse.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados do backend:', error)
        // Em caso de erro, continua com arrays vazios
        // O sistema pode funcionar offline se necessário
      } finally {
        setIsLoading(false)
      }
    }

    carregarDados()
  }, [])

  // Função para recarregar visitantes
  const recarregarVisitantes = useCallback(async () => {
    try {
      const visitantesResponse = await visitantesAPI.listar({ limit: 1000 })
      if (visitantesResponse.data) {
        setVisitantes(Array.isArray(visitantesResponse.data) ? visitantesResponse.data : [])
      }
    } catch (error) {
      console.error('Erro ao recarregar visitantes:', error)
    }
  }, [])

  // Adicionar visitante
  const adicionarVisitante = useCallback(async (visitante, foto = null) => {
    try {
      // Verificar se já existe visitante com mesmo CPF
      const cpfLimpo = visitante.cpf?.replace(/\D/g, '') || ''
      let visitanteExistente = null
      
      try {
        const buscaResponse = await visitantesAPI.buscarPorCPF(cpfLimpo)
        if (buscaResponse.data) {
          visitanteExistente = buscaResponse.data
        }
      } catch (error) {
        // Se não encontrar (404), continua para criar novo
        if (error.status !== 404) {
          console.warn('Erro ao buscar visitante por CPF:', error)
        }
      }

      let visitanteSalvo

      if (visitanteExistente && visitanteExistente.id) {
        // Atualizar visitante existente
        try {
          const updateResponse = await visitantesAPI.atualizar(
            visitanteExistente.id,
            visitante,
            foto
          )
          visitanteSalvo = updateResponse.data
          
          // Atualizar estado local
          setVisitantes(prev => {
            const index = prev.findIndex(v => v.id === visitanteExistente.id)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = visitanteSalvo
              return updated
            } else {
              // Se não encontrou no estado local, adicionar
              return [...prev, visitanteSalvo]
            }
          })
        } catch (updateError) {
          // Se erro 404 ou 500 ao atualizar, criar novo como fallback
          if (updateError.status === 404 || updateError.status === 500) {
            console.log(`Erro ${updateError.status} ao atualizar visitante, criando novo cadastro como fallback`)
            try {
              const createResponse = await visitantesAPI.criar(visitante, foto)
              visitanteSalvo = createResponse.data
              
              // Atualizar estado local
              setVisitantes(prev => {
                // Verificar se já não existe (evitar duplicatas)
                const exists = prev.find(v => v.id === visitanteSalvo.id)
                if (exists) {
                  return prev.map(v => v.id === visitanteSalvo.id ? visitanteSalvo : v)
                }
                return [...prev, visitanteSalvo]
              })
              
              // Se conseguiu criar, não lançar erro - fallback funcionou
              console.log('Fallback bem-sucedido: novo visitante criado após erro na atualização')
            } catch (createError) {
              // Se também falhar ao criar, lançar o erro original de atualização
              console.error('Erro ao criar novo visitante após falha na atualização:', createError)
              throw updateError
            }
          } else {
            throw updateError
          }
        }
      } else {
        // Criar novo visitante
        const createResponse = await visitantesAPI.criar(visitante, foto)
        visitanteSalvo = createResponse.data
        
        // Adicionar ao estado local
        setVisitantes(prev => {
          // Verificar se já não existe (evitar duplicatas)
          const exists = prev.find(v => v.id === visitanteSalvo.id)
          if (exists) {
            return prev.map(v => v.id === visitanteSalvo.id ? visitanteSalvo : v)
          }
          return [...prev, visitanteSalvo]
        })
      }

      // Recarregar lista de visitantes após salvar
      await recarregarVisitantes()

      return visitanteSalvo
    } catch (error) {
      console.error('Erro ao salvar visitante:', error)
      
      // Log detalhado para debugging
      if (error.data) {
        console.error('Detalhes do erro:', error.data)
      }
      if (error.status) {
        console.error('Status HTTP:', error.status)
      }
      if (error.code) {
        console.error('Código do erro:', error.code)
      }
      
      throw error
    }
  }, [recarregarVisitantes])

  // Registrar entrada
  const registrarEntrada = useCallback(async (visitanteId, dados) => {
    try {
      // Validar visitanteId
      if (!visitanteId) {
        throw new Error('ID do visitante é obrigatório')
      }

      // Preparar dados para envio
      // Nota: 'tipo' no registro é sempre 'ENTRADA' (definido no api.js)
      // O 'tipo' do visitante (visita, prestador, etc) não é enviado aqui
      const dadosEnvio = {
        sala: dados?.sala || null,
        observacoes: dados?.observacoes || null,
        foto: dados?.foto || null
      }

      console.log('Registrando entrada:', { visitanteId, dadosEnvio })

      const response = await registrosAPI.registrarEntrada(
        visitanteId,
        dadosEnvio,
        dadosEnvio.foto
      )
      
      console.log('Resposta do backend:', response)

      const registro = response.data?.registro || response.data
      const visitanteAtualizado = response.data?.visitante

      // Atualizar estado local
      if (registro) {
        setHistorico(prev => [registro, ...prev])
      }
      
      // Atualizar visitante no estado local
      if (visitanteAtualizado) {
        setVisitantes(prev => {
          const index = prev.findIndex(v => v.id === visitanteAtualizado.id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = visitanteAtualizado
            return updated
          } else {
            return [...prev, visitanteAtualizado]
          }
        })
      } else {
        // Se não retornou visitante, atualizar manualmente
        setVisitantes(prev => prev.map(v => {
          if (v.id === visitanteId) {
            return {
              ...v,
              status: 'dentro',
              ultimaVisita: registro?.dataEntrada || new Date().toISOString(),
              totalVisitas: (v.totalVisitas || 0) + 1
            }
          }
          return v
        }))
      }
      
      return registro
    } catch (error) {
      console.error('Erro ao registrar entrada:', error)
      
      // Log detalhado para debugging
      if (error.data) {
        console.error('Detalhes do erro:', error.data)
      }
      if (error.status) {
        console.error('Status HTTP:', error.status)
      }
      if (error.code) {
        console.error('Código do erro:', error.code)
      }
      
      throw error
    }
  }, [])

  // Registrar saída
  const registrarSaida = useCallback(async (registroId) => {
    try {
      const registro = historico.find(r => r.id === registroId)
      if (!registro) {
        throw new Error('Registro não encontrado')
      }

      const response = await registrosAPI.registrarSaida(registroId)
      const registroAtualizado = response.data

      // Atualizar estado local
      setHistorico(prev => prev.map(r => 
        r.id === registroId ? registroAtualizado : r
      ))
      
      // Atualizar status do visitante
      setVisitantes(prev => prev.map(v => 
        v.id === registro.visitanteId ? { ...v, status: 'fora' } : v
      ))
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
      throw error
    }
  }, [historico])

  // Buscar pessoa por CPF
  const buscarPorCPF = useCallback((cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Buscar em visitantes
    const visitante = visitantes.find(v => v.cpf?.replace(/\D/g, '') === cpfLimpo)
    if (visitante) return { ...visitante, tipo: 'visitante' }
    
    // Buscar em moradores
    const morador = moradores.find(m => m.cpf?.replace(/\D/g, '') === cpfLimpo)
    if (morador) return { ...morador, tipo: 'morador' }
    
    // Buscar em prestadores
    const prestador = prestadores.find(p => p.cpf?.replace(/\D/g, '') === cpfLimpo)
    if (prestador) return { ...prestador, tipo: 'prestador' }
    
    return null
  }, [visitantes, moradores, prestadores])

  // Adicionar morador
  const adicionarMorador = useCallback((morador) => {
    const novoMorador = {
      id: Date.now().toString(),
      ...morador,
      dataCadastro: new Date().toISOString(),
      ativo: true
    }
    setMoradores(prev => [...prev, novoMorador])
    return novoMorador
  }, [])

  // Adicionar prestador
  const adicionarPrestador = useCallback((prestador) => {
    const novoPrestador = {
      id: Date.now().toString(),
      ...prestador,
      dataCadastro: new Date().toISOString(),
      ativo: true
    }
    setPrestadores(prev => [...prev, novoPrestador])
    return novoPrestador
  }, [])

  // Adicionar agendamento
  const adicionarAgendamento = useCallback((agendamento) => {
    const novoAgendamento = {
      id: Date.now().toString(),
      ...agendamento,
      dataCriacao: new Date().toISOString(),
      status: 'pendente'
    }
    setAgendamentos(prev => [...prev, novoAgendamento])
    return novoAgendamento
  }, [])

  // Adicionar à blacklist
  const adicionarBlacklist = useCallback((pessoa) => {
    const novaEntrada = {
      id: Date.now().toString(),
      ...pessoa,
      dataAdicao: new Date().toISOString(),
      ativo: true
    }
    setBlacklist(prev => [...prev, novaEntrada])
    return novaEntrada
  }, [])

  // Verificar se está na blacklist
  const verificarBlacklist = useCallback(async (cpf) => {
    try {
      const cpfLimpo = cpf.replace(/\D/g, '')
      const response = await blacklistAPI.verificar(cpfLimpo)
      
      // Atualizar estado local se necessário
      if (response.data?.entrada && !blacklist.find(b => b.id === response.data.entrada.id)) {
        setBlacklist(prev => [...prev, response.data.entrada])
      }
      
      return response.data?.naBlacklist || false
    } catch (error) {
      console.error('Erro ao verificar blacklist:', error)
      // Fallback: verificar no estado local
      const cpfLimpo = cpf.replace(/\D/g, '')
      return blacklist.some(b => 
        b.cpf?.replace(/\D/g, '') === cpfLimpo && b.ativo
      )
    }
  }, [blacklist])

  // Obter estatísticas
  const obterEstatisticas = useCallback(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const visitasHoje = historico.filter(h => {
      const dataEntrada = new Date(h.dataEntrada)
      return dataEntrada >= hoje
    })
    
    const dentroAgora = historico.filter(h => h.status === 'dentro').length
    
    const visitantesFrequentes = visitantes
      .sort((a, b) => (b.totalVisitas || 0) - (a.totalVisitas || 0))
      .slice(0, 5)
    
    return {
      totalVisitantes: visitantes.length,
      totalMoradores: moradores.length,
      totalPrestadores: prestadores.length,
      visitasHoje: visitasHoje.length,
      dentroAgora,
      visitantesFrequentes,
      totalAgendamentos: agendamentos.filter(a => a.status === 'pendente').length
    }
  }, [visitantes, moradores, prestadores, historico, agendamentos])

  const value = {
    // Estados
    visitantes,
    moradores,
    historico,
    agendamentos,
    prestadores,
    blacklist,
    isLoading,
    
    // Ações
    adicionarVisitante,
    registrarEntrada,
    registrarSaida,
    buscarPorCPF,
    adicionarMorador,
    adicionarPrestador,
    adicionarAgendamento,
    adicionarBlacklist,
    verificarBlacklist,
    obterEstatisticas,
    recarregarVisitantes,
    
    // Setters (para atualizações locais quando necessário)
    setVisitantes,
    setMoradores,
    setHistorico,
    setAgendamentos,
    setPrestadores,
    setBlacklist
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
