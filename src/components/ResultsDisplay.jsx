import './ResultsDisplay.css'

function ResultsDisplay({ data }) {
  const formatCPF = (cpf) => {
    if (!cpf) return 'Não encontrado'
    const cleaned = cpf.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  const formatDate = (date) => {
    if (!date) return 'Não encontrado'
    // Tenta formatar datas em vários formatos
    const cleaned = date.replace(/\D/g, '')
    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
    }
    return date
  }

  return (
    <div className="results-display">
      <h2 className="results-title">Dados Extraídos</h2>
      <div className="results-content">
        <div className="result-item">
          <div className="result-label">
            Nome
          </div>
          <div className="result-value">
            {data.nome || 'Não encontrado'}
          </div>
        </div>

        <div className="result-item">
          <div className="result-label">
            CPF
          </div>
          <div className="result-value">
            {formatCPF(data.cpf)}
          </div>
        </div>

        <div className="result-item">
          <div className="result-label">
            Data de Nascimento
          </div>
          <div className="result-value">
            {formatDate(data.dataNascimento)}
          </div>
        </div>
      </div>

      {data.rawText && (
        <details className="raw-text-container">
          <summary className="raw-text-summary">Ver texto extraído (OCR)</summary>
          <pre className="raw-text">{data.rawText}</pre>
        </details>
      )}
    </div>
  )
}

export default ResultsDisplay
