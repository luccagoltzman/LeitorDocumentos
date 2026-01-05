import { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { useApp } from '../context/AppContext'
import Card from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import Input from './ui/Input'
import { formatCPF } from '../utils/formatters'
import { extractFaceDescriptor, findMatchingVisitor, detectFace, loadModels } from '../utils/faceRecognition'
import './FaceRecognition.css'

function FaceRecognition({ onRecognized, onNotRecognized, onCancel }) {
  const { visitantes } = useApp()
  const [isScanning, setIsScanning] = useState(true)
  const [recognizedVisitor, setRecognizedVisitor] = useState(null)
  const [sala, setSala] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [recognitionError, setRecognitionError] = useState(null)
  const webcamRef = useRef(null)
  const [capturedImage, setCapturedImage] = useState(null)

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user'
  }

  // Carregar modelos ao montar o componente
  useEffect(() => {
    const initializeModels = async () => {
      try {
        setModelsLoading(true)
        const loaded = await loadModels()
        if (!loaded) {
          // Não é erro crítico - sistema funciona em modo manual
          console.log('Reconhecimento automático não disponível. Usando modo de seleção manual.')
        }
      } catch (error) {
        // Não é erro crítico - sistema funciona em modo manual
        console.log('Reconhecimento automático não disponível. Usando modo de seleção manual.', error)
      } finally {
        setModelsLoading(false)
      }
    }

    initializeModels()
  }, [])

  const captureAndRecognize = useCallback(async () => {
    if (!webcamRef.current) return

    setIsProcessing(true)
    setRecognitionError(null)
    
    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) return

      setCapturedImage(imageSrc)

      // Verificar se há um rosto na imagem
      const hasFace = await detectFace(imageSrc)
      if (!hasFace) {
        setRecognitionError('Nenhum rosto detectado. Por favor, posicione o rosto na câmera.')
        setIsScanning(false)
        setIsProcessing(false)
        return
      }

      // Tentar extrair descritor facial da imagem capturada
      const capturedDescriptor = await extractFaceDescriptor(imageSrc)
      
      if (!capturedDescriptor) {
        // Se não conseguir extrair descritor (face-api não disponível ou erro)
        // Vai direto para seleção manual
        setIsScanning(false)
        setIsProcessing(false)
        return
      }

      // Buscar correspondência entre visitantes cadastrados
      const match = await findMatchingVisitor(capturedDescriptor, visitantes, 0.6)
      
      if (match && match.visitor) {
        // Visitante reconhecido!
        setRecognizedVisitor(match.visitor)
        setIsScanning(false)
      } else {
        // Não encontrou correspondência - mostrar seleção manual
        setIsScanning(false)
      }
      
    } catch (error) {
      console.error('Erro ao processar reconhecimento:', error)
      setRecognitionError('Erro ao processar reconhecimento. Use a seleção manual.')
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        setCapturedImage(imageSrc)
        setIsScanning(false)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [visitantes])

  const handleManualSelect = (visitante) => {
    setRecognizedVisitor(visitante)
  }

  const handleConfirm = async () => {
    if (recognizedVisitor && sala.trim()) {
      onRecognized({
        visitante: recognizedVisitor,
        sala: sala.trim(),
        foto: capturedImage
      })
    }
  }

  const visitorsWithPhoto = visitantes.filter(v => v.foto)

  return (
    <Card 
      title="Reconhecimento Facial"
      subtitle={recognizedVisitor ? "Visitante reconhecido" : "Posicione o rosto na câmera"}
      className="face-recognition"
    >
      {isScanning ? (
        <div className="recognition-container">
          <div className="camera-wrapper">
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
          </div>

          <div className="recognition-controls">
            {modelsLoading && (
              <p className="loading-message">Carregando modelos de reconhecimento...</p>
            )}
            {recognitionError && (
              <p className="error-message-inline">{recognitionError}</p>
            )}
            <div className="controls-buttons">
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={captureAndRecognize}
                disabled={isProcessing || modelsLoading}
                size="lg"
              >
                {isProcessing ? 'Reconhecendo...' : 'Reconhecer'}
              </Button>
            </div>
          </div>
        </div>
      ) : recognizedVisitor ? (
        <div className="recognized-container">
          <div className="recognized-visitor">
            {recognizedVisitor.foto && (
              <div className="visitor-photo-preview">
                <img src={recognizedVisitor.foto} alt={recognizedVisitor.nome} />
              </div>
            )}
            <div className="visitor-info">
              <h3>{recognizedVisitor.nome}</h3>
              <p>CPF: {formatCPF(recognizedVisitor.cpf)}</p>
              <Badge variant="success">Visitante Cadastrado</Badge>
            </div>
          </div>

          <Input
            label="Sala/Apartamento de Destino"
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            placeholder="Ex: Sala 101, Andar 3, Sala 205"
            fullWidth
            required
          />

          <div className="confirm-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setRecognizedVisitor(null)
                setIsScanning(true)
                setSala('')
              }}
            >
              Refazer
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!sala.trim()}
              size="lg"
            >
              Confirmar Entrada
            </Button>
          </div>
        </div>
      ) : (
        <div className="manual-select-container">
          <div className="manual-select-header">
            <p>Não foi possível reconhecer automaticamente.</p>
            {recognitionError && (
              <p className="error-message">{recognitionError}</p>
            )}
            <p className="hint">Selecione o visitante na lista abaixo:</p>
          </div>

          {visitorsWithPhoto.length === 0 ? (
            <div className="no-photos">
              <p>Nenhum visitante com foto cadastrada.</p>
              <Button variant="secondary" onClick={onNotRecognized}>
                Fazer Cadastro Normal
              </Button>
            </div>
          ) : (
            <>
              <div className="visitors-grid">
                {visitorsWithPhoto.slice(0, 6).map(visitante => (
                  <div
                    key={visitante.id}
                    className="visitor-option"
                    onClick={() => handleManualSelect(visitante)}
                  >
                    <div className="visitor-option-photo">
                      <img src={visitante.foto} alt={visitante.nome} />
                    </div>
                    <p className="visitor-option-name">{visitante.nome}</p>
                  </div>
                ))}
              </div>

              <div className="manual-select-actions">
                <Button variant="secondary" onClick={onNotRecognized}>
                  Não encontrei o visitante
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

export default FaceRecognition
