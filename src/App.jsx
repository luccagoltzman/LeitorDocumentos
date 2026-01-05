import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Login from './components/Login'
import DocumentReader from './components/DocumentReader'
import FaceRecognition from './components/FaceRecognition'
import FaceCapture from './components/FaceCapture'
import VisitorRegistration from './components/VisitorRegistration'
import EntryControl from './components/EntryControl'
import VisitHistory from './components/VisitHistory'
import PeopleSearch from './components/PeopleSearch'
import VisitScheduling from './components/VisitScheduling'
import QRCodeGenerator from './components/QRCodeGenerator'
import Dashboard from './components/Dashboard'
import VisitorsList from './components/VisitorsList'
import { useDocumentScanner } from './hooks/useDocumentScanner'
import { authAPI } from './services/api'
import './App.css'

function AppContent({ onLogout }) {
  const [currentView, setCurrentView] = useState('scanner')
  const [extractedData, setExtractedData] = useState(null)
  const [facePhoto, setFacePhoto] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [registrationStep, setRegistrationStep] = useState('scan') // scan, face, register, entry, faceRecognition
  
  const { scanDocument, isProcessing, extractedData: scannedData, reset } = useDocumentScanner()

  const handleScanComplete = async (imageSrc) => {
    try {
      const data = await scanDocument(imageSrc)
      setExtractedData(data)
      setRegistrationStep('face') // Ir para captura de foto
    } catch (error) {
      console.error('Erro ao escanear:', error)
    }
  }

  const handleFaceCapture = (photo) => {
    setFacePhoto(photo)
    setRegistrationStep('register')
  }

  const handleRegistrationComplete = async (visitante) => {
    setSelectedPerson(visitante)
    setRegistrationStep('entry')
  }

  const handleEntryComplete = () => {
    setExtractedData(null)
    setFacePhoto(null)
    setSelectedPerson(null)
    setRegistrationStep('scan')
    reset()
  }

  const handlePersonSelect = (person) => {
    setSelectedPerson(person)
    setCurrentView('scanner')
    setRegistrationStep('entry')
  }

  const handleFaceRecognized = async (data) => {
    const { visitante, sala, foto } = data
    const visitanteComSala = { ...visitante, sala, foto }
    setSelectedPerson(visitanteComSala)
    setRegistrationStep('entry')
  }

  const handleFaceNotRecognized = () => {
    setRegistrationStep('scan')
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      
      case 'faceRecognition':
        return (
          <FaceRecognition
            onRecognized={handleFaceRecognized}
            onNotRecognized={handleFaceNotRecognized}
            onCancel={() => setCurrentView('scanner')}
          />
        )
      
      case 'visitors':
        return <VisitorsList onSelectVisitor={handlePersonSelect} />
      
      case 'history':
        return <VisitHistory />
      
      case 'search':
        return <PeopleSearch onSelectPerson={handlePersonSelect} />
      
      case 'scheduling':
        return <VisitScheduling />
      
      case 'qrcode':
        return <QRCodeGenerator />
      
      case 'scanner':
      default:
        // Fluxo de reconhecimento facial (para visitantes já cadastrados)
        if (registrationStep === 'faceRecognition') {
          return (
            <FaceRecognition
              onRecognized={handleFaceRecognized}
              onNotRecognized={handleFaceNotRecognized}
              onCancel={() => {
                setRegistrationStep('scan')
              }}
            />
          )
        }
        
        if (registrationStep === 'face' && extractedData) {
          return (
            <FaceCapture
              onCapture={handleFaceCapture}
              onCancel={() => {
                setRegistrationStep('scan')
                setExtractedData(null)
                reset()
              }}
            />
          )
        }
        
        if (registrationStep === 'register' && extractedData && facePhoto) {
          return (
            <VisitorRegistration
              extractedData={{ ...extractedData, foto: facePhoto }}
              onComplete={handleRegistrationComplete}
              onCancel={() => {
                setRegistrationStep('face')
                setFacePhoto(null)
              }}
            />
          )
        }
        
        if (registrationStep === 'entry' && selectedPerson) {
          return (
            <EntryControl
              visitante={selectedPerson}
              onComplete={handleEntryComplete}
            />
          )
        }
        
        return (
          <DocumentReader
            onImageProcess={handleScanComplete}
            isProcessing={isProcessing}
          />
        )
    }
  }

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      onLogout={onLogout}
    >
      {renderView()}
    </Layout>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('auth_token')
  })

  useEffect(() => {
    // Verificar autenticação ao montar
    const token = localStorage.getItem('auth_token')
    setIsAuthenticated(!!token)

    // Ouvir evento de não autorizado
    const handleUnauthorized = () => {
      setIsAuthenticated(false)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authAPI.logout()
    setIsAuthenticated(false)
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <AppProvider>
      <AppContent onLogout={handleLogout} />
    </AppProvider>
  )
}

export default App

