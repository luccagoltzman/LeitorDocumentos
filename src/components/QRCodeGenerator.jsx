import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import { useApp } from '../context/AppContext'
import './QRCodeGenerator.css'

function QRCodeGenerator() {
  const { visitantes, agendamentos } = useApp()
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [qrData, setQrData] = useState(null)

  const generateQR = (person) => {
    const data = {
      id: person.id,
      nome: person.nome,
      cpf: person.cpf,
      tipo: person.category || 'visitante',
      timestamp: new Date().toISOString()
    }
    setQrData(JSON.stringify(data))
    setSelectedPerson(person)
  }

  const generateFromAgendamento = (agendamento) => {
    const data = {
      agendamentoId: agendamento.id,
      nome: agendamento.nomeVisitante,
      cpf: agendamento.cpfVisitante,
      apartamento: agendamento.apartamento,
      dataHora: agendamento.dataHora,
      tipo: agendamento.tipo
    }
    setQrData(JSON.stringify(data))
    setSelectedPerson({
      nome: agendamento.nomeVisitante,
      category: 'agendamento'
    })
  }

  const downloadQR = () => {
    const svg = document.getElementById('qrcode-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `qrcode-${selectedPerson?.nome || 'visitante'}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const recentVisitors = visitantes.slice(0, 5)
  const todayAgendamentos = agendamentos.filter(a => {
    const hoje = new Date().toISOString().split('T')[0]
    return a.dataHora?.startsWith(hoje) && a.status === 'pendente'
  })

  return (
    <div className="qrcode-generator-container">
      <Card title="Gerar QR Code" className="qrcode-generator">
        <div className="qrcode-content">
          {qrData ? (
            <div className="qrcode-display">
              <div className="qrcode-wrapper">
                <QRCodeSVG
                  id="qrcode-svg"
                  value={qrData}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              {selectedPerson && (
                <div className="qrcode-info">
                  <h4>{selectedPerson.nome}</h4>
                  <p className="qrcode-type">{selectedPerson.category}</p>
                </div>
              )}
              <div className="qrcode-actions">
                <Button variant="secondary" onClick={() => setQrData(null)}>
                  Limpar
                </Button>
                <Button variant="primary" onClick={downloadQR}>
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="qrcode-options">
              <div className="option-section">
                <h3 className="option-title">Visitantes Recentes</h3>
                {recentVisitors.length === 0 ? (
                  <p className="empty-message">Nenhum visitante cadastrado</p>
                ) : (
                  <div className="person-list">
                    {recentVisitors.map(visitante => (
                      <div key={visitante.id} className="person-option">
                        <div className="person-option-info">
                          <span className="person-option-name">{visitante.nome}</span>
                          {visitante.apartamento && (
                            <span className="person-option-apt">Apto: {visitante.apartamento}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => generateQR({ ...visitante, category: 'visitante' })}
                        >
                          Gerar QR
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {todayAgendamentos.length > 0 && (
                <div className="option-section">
                  <h3 className="option-title">Agendamentos de Hoje</h3>
                  <div className="person-list">
                    {todayAgendamentos.map(agendamento => (
                      <div key={agendamento.id} className="person-option">
                        <div className="person-option-info">
                          <span className="person-option-name">{agendamento.nomeVisitante}</span>
                          <span className="person-option-apt">Apto: {agendamento.apartamento}</span>
                          <span className="person-option-time">{agendamento.dataHora}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => generateFromAgendamento(agendamento)}
                        >
                          Gerar QR
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default QRCodeGenerator
