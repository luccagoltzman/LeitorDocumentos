import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import Card from './ui/Card'
import Button from './ui/Button'
import './FaceCapture.css'

function FaceCapture({ onCapture, onCancel }) {
  const [isCapturing, setIsCapturing] = useState(true)
  const [capturedImage, setCapturedImage] = useState(null)
  const webcamRef = useRef(null)

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user' // Câmera frontal
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      setIsCapturing(false)
    }
  }, [webcamRef])

  const handleRetake = () => {
    setCapturedImage(null)
    setIsCapturing(true)
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  return (
    <Card 
      title="Captura de Foto do Visitante"
      subtitle="Posicione o rosto no centro da tela"
      className="face-capture"
    >
      <div className="capture-container">
        {isCapturing ? (
          <div className="webcam-wrapper">
            <div className="face-guide">
              <div className="guide-circle"></div>
              <p className="guide-text">Posicione o rosto dentro do círculo</p>
            </div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="webcam-video"
              mirrored={true}
            />
            <div className="capture-controls">
              <Button
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={capture}
                size="lg"
              >
                Capturar Foto
              </Button>
            </div>
          </div>
        ) : (
          <div className="preview-container">
            <div className="preview-wrapper">
              <img src={capturedImage} alt="Foto capturada" className="preview-image" />
            </div>
            <div className="preview-controls">
              <Button
                variant="secondary"
                onClick={handleRetake}
              >
                Refazer
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                size="lg"
              >
                Confirmar Foto
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default FaceCapture
