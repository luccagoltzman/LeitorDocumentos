import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { formatCPF, formatDateOnly } from '../utils/formatters'
import './PeopleSearch.css'

function PeopleSearch({ onSelectPerson }) {
  const { visitantes, moradores, prestadores } = useApp()
  const [searchTerm, setSearchTerm] = useState('')

  const allPeople = useMemo(() => {
    const people = [
      ...visitantes.map(v => ({ ...v, category: 'visitante' })),
      ...moradores.map(m => ({ ...m, category: 'morador' })),
      ...prestadores.map(p => ({ ...p, category: 'prestador' }))
    ]
    return people
  }, [visitantes, moradores, prestadores])

  const filteredPeople = useMemo(() => {
    if (!searchTerm) return []
    
    const term = searchTerm.toLowerCase()
    return allPeople.filter(person => {
      const matchesName = person.nome?.toLowerCase().includes(term)
      const matchesCPF = person.cpf?.includes(searchTerm)
      const matchesPhone = person.telefone?.includes(searchTerm)
      return matchesName || matchesCPF || matchesPhone
    }).slice(0, 20) // Limitar resultados
  }, [allPeople, searchTerm])

  const getCategoryBadge = (category) => {
    const variants = {
      visitante: 'info',
      morador: 'success',
      prestador: 'warning'
    }
    return variants[category] || 'default'
  }

  const getCategoryLabel = (category) => {
    const labels = {
      visitante: 'Visitante',
      morador: 'Morador',
      prestador: 'Prestador'
    }
    return labels[category] || category
  }

  return (
    <Card title="Buscar Pessoa" className="people-search">
      <div className="search-input-wrapper">
        <Input
          placeholder="Buscar por nome, CPF ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </div>

      {searchTerm && (
        <div className="search-results">
          {filteredPeople.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma pessoa encontrada</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <span className="results-count">{filteredPeople.length} resultado(s) encontrado(s)</span>
              </div>
              <div className="people-list">
                {filteredPeople.map(person => (
                  <div key={person.id} className="person-item">
                    <div className="person-info">
                      <div className="person-header">
                        <h4 className="person-name">{person.nome}</h4>
                        <Badge variant={getCategoryBadge(person.category)}>
                          {getCategoryLabel(person.category)}
                        </Badge>
                      </div>
                      <div className="person-details">
                        {person.cpf && (
                          <div className="person-detail">
                            <span className="detail-label">CPF:</span>
                            <span className="detail-value">{formatCPF(person.cpf)}</span>
                          </div>
                        )}
                        {person.telefone && (
                          <div className="person-detail">
                            <span className="detail-label">Telefone:</span>
                            <span className="detail-value">{person.telefone}</span>
                          </div>
                        )}
                        {person.dataNascimento && (
                          <div className="person-detail">
                            <span className="detail-label">Nascimento:</span>
                            <span className="detail-value">{person.dataNascimento}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {onSelectPerson && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectPerson(person)}
                      >
                        Selecionar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!searchTerm && (
        <div className="search-hint">
          <p>Digite pelo menos 3 caracteres para buscar</p>
        </div>
      )}
    </Card>
  )
}

export default PeopleSearch
