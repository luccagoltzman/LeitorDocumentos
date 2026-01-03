import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import DocumentReader from './components/DocumentReader'
import VisitorRegistration from './components/VisitorRegistration'
import EntryControl from './components/EntryControl'
import VisitHistory from './components/VisitHistory'
import PeopleSearch from './components/PeopleSearch'
import VisitScheduling from './components/VisitScheduling'
import QRCodeGenerator from './components/QRCodeGenerator'
import Dashboard from './components/Dashboard'
import { useDocumentScanner } from './hooks/useDocumentScanner'
import './App.css'

function AppContent() {
  const [currentView, setCurrentView] = useState('scanner')
  const [extractedData, setExtractedData] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [registrationStep, setRegistrationStep] = useState('scan') // scan, register, entry
  
  const { scanDocument, isProcessing, extractedData: scannedData, reset } = useDocumentScanner()

  const handleScanComplete = async (imageSrc) => {
    try {
      const data = await scanDocument(imageSrc)
      setExtractedData(data)
      setRegistrationStep('register')
    } catch (error) {
      console.error('Erro ao escanear:', error)
    }
  }

  const handleRegistrationComplete = (visitante) => {
    setSelectedPerson(visitante)
    setRegistrationStep('entry')
  }

  const handleEntryComplete = () => {
    setExtractedData(null)
    setSelectedPerson(null)
    setRegistrationStep('scan')
    reset()
  }

  const handlePersonSelect = (person) => {
    setSelectedPerson(person)
    setCurrentView('scanner')
    setRegistrationStep('entry')
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      
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
        if (registrationStep === 'register' && extractedData) {
          return (
            <VisitorRegistration
              extractedData={extractedData}
              onComplete={handleRegistrationComplete}
              onCancel={() => {
                setRegistrationStep('scan')
                setExtractedData(null)
                reset()
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
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App

