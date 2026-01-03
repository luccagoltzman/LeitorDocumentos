import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import './WebcamCapture.css'

function WebcamCapture({ onImageProcess, isProcessing }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const webcamRef = useRef(null)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment'
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      setIsCapturing(false)
    }
  }, [webcamRef])

  const handleStartCapture = () => {
    setIsCapturing(true)
    setCapturedImage(null)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setIsCapturing(true)
  }

  const handleProcess = () => {
    if (capturedImage) {
      onImageProcess(capturedImage)
    }
  }

  return (
    <div className="webcam-capture">
      {!isCapturing && !capturedImage && (
        <div className="webcam-placeholder">
          <div className="webcam-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <p>Clique no botão abaixo para iniciar a captura</p>
          <button
            className="start-capture-btn"
            onClick={handleStartCapture}
            disabled={isProcessing}
          >
            Iniciar Câmera
          </button>
        </div>
      )}

      {isCapturing && (
        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam-video"
          />
          <div className="webcam-controls">
            <button
              className="capture-btn"
              onClick={capture}
            >
              Capturar
            </button>
            <button
              className="cancel-btn"
              onClick={() => setIsCapturing(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="captured-image-container">
          <img src={capturedImage} alt="Captured" className="captured-image" />
          <div className="captured-controls">
            <button
              className="retake-btn"
              onClick={handleRetake}
              disabled={isProcessing}
            >
              Refazer
            </button>
            <button
              className="process-btn"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Processar Documento'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebcamCapture
