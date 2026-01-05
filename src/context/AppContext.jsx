import { createContext, useContext, useState, useCallback } from 'react'

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

  // Adicionar visitante
  const adicionarVisitante = useCallback((visitante) => {
    const novoVisitante = {
      id: Date.now().toString(),
      ...visitante,
      dataCadastro: new Date().toISOString(),
      status: 'cadastrado'
    }
    setVisitantes(prev => [...prev, novoVisitante])
    return novoVisitante
  }, [])

  // Registrar entrada
  const registrarEntrada = useCallback((visitanteId, dados) => {
    const registro = {
      id: Date.now().toString(),
      visitanteId,
      tipo: dados.tipo || 'visita',
      moradorId: dados.moradorId || null,
      foto: dados.foto || null,
      dataEntrada: new Date().toISOString(),
      dataSaida: null,
      status: 'dentro'
    }
    setHistorico(prev => [registro, ...prev])
    
    // Atualizar status do visitante
    setVisitantes(prev => prev.map(v => 
      v.id === visitanteId ? { ...v, status: 'dentro', ultimaVisita: registro.dataEntrada } : v
    ))
    
    return registro
  }, [])

  // Registrar saída
  const registrarSaida = useCallback((registroId) => {
    setHistorico(prev => prev.map(r => 
      r.id === registroId 
        ? { ...r, dataSaida: new Date().toISOString(), status: 'fora' }
        : r
    ))
    
    // Atualizar status do visitante
    const registro = historico.find(r => r.id === registroId)
    if (registro) {
      setVisitantes(prev => prev.map(v => 
        v.id === registro.visitanteId ? { ...v, status: 'fora' } : v
      ))
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
  const verificarBlacklist = useCallback((cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    return blacklist.some(b => 
      b.cpf?.replace(/\D/g, '') === cpfLimpo && b.ativo
    )
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
    
    // Setters para uso futuro com backend
    setVisitantes,
    setMoradores,
    setHistorico,
    setAgendamentos,
    setPrestadores,
    setBlacklist
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
