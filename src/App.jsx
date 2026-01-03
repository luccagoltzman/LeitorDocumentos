import { useState } from 'react'
import DocumentReader from './components/DocumentReader'
import ResultsDisplay from './components/ResultsDisplay'
import './App.css'

function App() {
  const [extractedData, setExtractedData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDataExtracted = (data) => {
    setExtractedData(data)
  }

  const handleProcessingChange = (processing) => {
    setIsProcessing(processing)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Leitor de Documentos</h1>
        <p>Extraia automaticamente informações de CNH ou RG</p>
      </header>

      <main className="app-main">
        <DocumentReader
          onDataExtracted={handleDataExtracted}
          onProcessingChange={handleProcessingChange}
          isProcessing={isProcessing}
        />
        
        {extractedData && (
          <ResultsDisplay data={extractedData} />
        )}
      </main>
    </div>
  )
}

export default App
