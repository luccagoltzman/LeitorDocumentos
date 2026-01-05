// Importação dinâmica para compatibilidade com Vite
let faceapi = null
let faceAPIAvailable = false

const loadFaceAPI = async () => {
  if (faceapi) return faceapi
  
  try {
    faceapi = await import('face-api.js')
    faceAPIAvailable = true
    return faceapi
  } catch (error) {
    console.warn('face-api.js não disponível. Usando modo de seleção manual.', error)
    faceAPIAvailable = false
    return null
  }
}

let modelsLoaded = false

/**
 * Carrega os modelos do face-api.js
 */
export const loadModels = async () => {
  if (modelsLoaded) return true

  const api = await loadFaceAPI()
  if (!api) {
    return false
  }

  try {
    const MODEL_URL = '/models' // Os modelos devem estar na pasta public/models
    
    await Promise.all([
      api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      api.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ])
    
    modelsLoaded = true
    return true
  } catch (error) {
    console.error('Erro ao carregar modelos:', error)
    // Fallback: usar modelos do CDN se não encontrar localmente
    try {
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
      
      await Promise.all([
        api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        api.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ])
      
      modelsLoaded = true
      return true
    } catch (cdnError) {
      console.error('Erro ao carregar modelos do CDN:', cdnError)
      return false
    }
  }
}

/**
 * Extrai o descritor facial de uma imagem
 */
export const extractFaceDescriptor = async (imageSrc) => {
  const api = await loadFaceAPI()
  if (!api) {
    return null
  }

  if (!modelsLoaded) {
    const loaded = await loadModels()
    if (!loaded) {
      return null
    }
  }

  try {
    const img = await api.fetchImage(imageSrc)
    const detection = await api
      .detectSingleFace(img, new api.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      return null
    }

    return detection.descriptor
  } catch (error) {
    console.error('Erro ao extrair descritor facial:', error)
    return null
  }
}

/**
 * Compara dois descritores faciais e retorna a distância (quanto menor, mais similar)
 */
export const compareFaceDescriptors = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) {
    return Infinity
  }

  // Calcula a distância euclidiana entre os descritores
  let distance = 0
  for (let i = 0; i < descriptor1.length; i++) {
    distance += Math.pow(descriptor1[i] - descriptor2[i], 2)
  }
  return Math.sqrt(distance)
}

/**
 * Encontra o visitante mais similar baseado no descritor facial
 * @param {Float32Array} capturedDescriptor - Descritor da foto capturada
 * @param {Array} visitors - Array de visitantes com fotos
 * @param {number} threshold - Limite de similaridade (padrão: 0.6)
 * @returns {Object|null} - Visitante mais similar ou null se não encontrar
 */
export const findMatchingVisitor = async (capturedDescriptor, visitors, threshold = 0.6) => {
  if (!capturedDescriptor) {
    return null
  }

  const visitorsWithPhotos = visitors.filter(v => v.foto)
  
  if (visitorsWithPhotos.length === 0) {
    return null
  }

  let bestMatch = null
  let bestDistance = Infinity

  // Compara com cada visitante cadastrado
  for (const visitor of visitorsWithPhotos) {
    try {
      const visitorDescriptor = await extractFaceDescriptor(visitor.foto)
      
      if (visitorDescriptor) {
        const distance = compareFaceDescriptors(capturedDescriptor, visitorDescriptor)
        
        if (distance < bestDistance && distance < threshold) {
          bestDistance = distance
          bestMatch = { visitor, distance, confidence: 1 - (distance / threshold) }
        }
      }
    } catch (error) {
      console.error(`Erro ao processar visitante ${visitor.id}:`, error)
      continue
    }
  }

  return bestMatch
}

/**
 * Verifica se há um rosto na imagem
 */
export const detectFace = async (imageSrc) => {
  const api = await loadFaceAPI()
  if (!api) {
    // Se face-api não estiver disponível, assume que há rosto (modo manual)
    return true
  }

  if (!modelsLoaded) {
    const loaded = await loadModels()
    if (!loaded) {
      return true // Fallback: assume que há rosto
    }
  }

  try {
    const img = await api.fetchImage(imageSrc)
    const detection = await api.detectSingleFace(img, new api.TinyFaceDetectorOptions())
    return detection !== undefined
  } catch (error) {
    console.error('Erro ao detectar rosto:', error)
    return true // Fallback: assume que há rosto para permitir seleção manual
  }
}
