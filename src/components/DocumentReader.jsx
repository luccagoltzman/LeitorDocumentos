import { useState } from 'react'
import ImageUpload from './ImageUpload'
import WebcamCapture from './WebcamCapture'
import { extractDocumentData } from '../utils/documentParser'
import './DocumentReader.css'

function DocumentReader({ onDataExtracted, onProcessingChange, isProcessing }) {
  const [activeTab, setActiveTab] = useState('upload')

  const handleImageProcess = async (imageSrc) => {
    onProcessingChange(true)
    try {
      const data = await extractDocumentData(imageSrc)
      onDataExtracted(data)
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      alert('Erro ao processar a imagem. Tente novamente.')
    } finally {
      onProcessingChange(false)
    }
  }

  return (
    <div className="document-reader">
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
          <ImageUpload onImageProcess={handleImageProcess} isProcessing={isProcessing} />
        ) : (
          <WebcamCapture onImageProcess={handleImageProcess} isProcessing={isProcessing} />
        )}
      </div>
    </div>
  )
}

export default DocumentReader
