import { useState } from 'react'
import ImageUpload from './ImageUpload'
import WebcamCapture from './WebcamCapture'
import Card from './ui/Card'
import './DocumentReader.css'

function DocumentReader({ onImageProcess, isProcessing }) {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <Card title="Escanear Documento" className="document-reader">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
          disabled={isProcessing}
        >
          Upload de Imagem
        </button>
        <button
          className={`tab ${activeTab === 'webcam' ? 'active' : ''}`}
          onClick={() => setActiveTab('webcam')}
          disabled={isProcessing}
        >
          Captura em Tempo Real
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'upload' ? (
          <ImageUpload onImageProcess={onImageProcess} isProcessing={isProcessing} />
        ) : (
          <WebcamCapture onImageProcess={onImageProcess} isProcessing={isProcessing} />
        )}
      </div>
    </Card>
  )
}

export default DocumentReader
