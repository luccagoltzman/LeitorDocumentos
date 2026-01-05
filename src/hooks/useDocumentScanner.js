import { useState, useCallback } from 'react'
import { extractDocumentData } from '../utils/documentParser'

export const useDocumentScanner = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)

  const scanDocument = useCallback(async (imageSrc) => {
    setIsProcessing(true)
    setError(null)
    setExtractedData(null)

    try {
      // Usar OCR local (Tesseract.js) enquanto o backend não implementa OCR
      // Quando o backend implementar, podemos alternar para usar a API
      const data = await extractDocumentData(imageSrc)
      setExtractedData(data)
      return data
    } catch (err) {
      const errorMessage = err.message || 'Erro ao processar documento'
      setError(errorMessage)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setExtractedData(null)
    setError(null)
    setIsProcessing(false)
  }, [])

  return {
    scanDocument,
    isProcessing,
    extractedData,
    error,
    reset
  }
}
