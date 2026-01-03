import { createWorker } from 'tesseract.js'

/**
 * Extrai texto de uma imagem usando OCR
 */
async function extractTextFromImage(imageSrc) {
  const worker = await createWorker('por') // Português
  const { data: { text } } = await worker.recognize(imageSrc)
  await worker.terminate()
  return text
}

/**
 * Extrai CPF do texto
 */
function extractCPF(text) {
  // Remove espaços e caracteres especiais, mantendo apenas números
  const cleaned = text.replace(/\s/g, '')
  
  // Padrão para CPF: 11 dígitos consecutivos
  const cpfPattern = /\b\d{11}\b/g
  const matches = cleaned.match(cpfPattern)
  
  if (matches && matches.length > 0) {
    // Retorna o primeiro CPF encontrado
    return matches[0]
  }
  
  // Tenta encontrar CPF com formatação (XXX.XXX.XXX-XX)
  const formattedPattern = /\d{3}\.\d{3}\.\d{3}-\d{2}/g
  const formattedMatches = text.match(formattedPattern)
  
  if (formattedMatches && formattedMatches.length > 0) {
    return formattedMatches[0].replace(/\D/g, '')
  }
  
  return null
}

/**
 * Extrai data de nascimento do texto
 * Prioriza padrões específicos de CNH e RG
 */
function extractDateOfBirth(text) {
  const lines = text.split('\n').map(line => line.trim())
  
  // Padrão 1: CNH - Procura por "DATA, LOCAL E UF DE NASCIMENTO" ou "NASCIMENTO"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase()
    
    // Procura por indicadores de data de nascimento
    if (line.includes('NASCIMENTO') || line.includes('NASC') || 
        line.includes('DATA, LOCAL') || line.includes('DATA LOCAL')) {
      
      // Verifica a linha atual e as próximas
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        const searchLine = lines[j]
        
        // Procura por data no formato DD/MM/YYYY
        const dateMatch = searchLine.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/)
        if (dateMatch) {
          const day = parseInt(dateMatch[1])
          const month = parseInt(dateMatch[2])
          const year = parseInt(dateMatch[3])
          
          // Validação
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
            // Verifica se a data é razoável (não muito no futuro)
            if (year >= 1900 && year <= new Date().getFullYear()) {
              // Se a linha contém vírgula após a data, pega só a parte antes da vírgula
              const beforeComma = searchLine.split(',')[0].trim()
              const dateInBeforeComma = beforeComma.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/)
              if (dateInBeforeComma) {
                return dateInBeforeComma[0]
              }
              return dateMatch[0]
            }
          }
        }
      }
    }
  }
  
  // Padrão 2: Fallback - procura todas as datas e valida
  const datePatterns = [
    /\b(\d{2})\/(\d{2})\/(\d{4})\b/g,  // DD/MM/YYYY
    /\b(\d{2})-(\d{2})-(\d{4})\b/g,    // DD-MM-YYYY
    /\b(\d{2})\.(\d{2})\.(\d{4})\b/g,  // DD.MM.YYYY
  ]
  
  const allDates = []
  for (const pattern of datePatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const day = parseInt(match[1])
      const month = parseInt(match[2])
      const year = parseInt(match[3])
      
      // Validação básica
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        // Verifica se a data é razoável (não muito no futuro ou passado)
        if (year >= 1900 && year <= new Date().getFullYear()) {
          allDates.push({
            date: match[0],
            year: year
          })
        }
      }
    }
  }
  
  // Retorna a data mais antiga (provavelmente a de nascimento)
  if (allDates.length > 0) {
    allDates.sort((a, b) => a.year - b.year)
    return allDates[0].date
  }
  
  return null
}

/**
 * Extrai nome do texto
 * Procura por padrões específicos de CNH e RG
 */
function extractName(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 3)
  
  // Padrão 1: CNH - Procura por "NOME E SOBRENONE" ou "NOME" seguido de "1º HABILITAÇÃO"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase()
    
    // Procura por indicadores de nome (mais flexível para variações do OCR)
    const hasNome = line.includes('NOME')
    const hasSobrenome = line.includes('SOBRENONE') || line.includes('SOBRENOME') || line.includes('SOBREN')
    const hasHabilitacao = line.includes('HABILITAÇÃO') || line.includes('HABILITACAO') || line.includes('HABILIT')
    
    if (hasNome && (hasSobrenome || hasHabilitacao)) {
      
      // Verifica a linha seguinte (onde geralmente está o nome)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim()
        
        // Remove datas e números do final da linha
        // Padrão: "NOME COMPLETO DD/MM/YYYY" -> pega só o nome
        let nameCandidate = nextLine
        
        // Remove datas no formato DD/MM/YYYY do final (com qualquer coisa depois)
        nameCandidate = nameCandidate.replace(/\s+\d{2}\/\d{2}\/\d{4}.*$/, '')
        // Remove números longos no final (como número de registro)
        nameCandidate = nameCandidate.replace(/\s+\d{8,}.*$/, '')
        // Remove caracteres especiais no início e fim
        nameCandidate = nameCandidate.replace(/^[^\w\s]+/, '').replace(/[^\w\s]+$/, '')
        // Remove espaços múltiplos
        nameCandidate = nameCandidate.replace(/\s+/g, ' ').trim()
        
        // Verifica se parece um nome (2-6 palavras, apenas letras e espaços)
        const words = nameCandidate.split(/\s+/).filter(w => w.length > 0 && !/^\d+$/.test(w))
        if (words.length >= 2 && words.length <= 6) {
          // Verifica se todas as palavras são principalmente letras
          const allWordsAreNames = words.every(w => /^[A-ZÁÉÍÓÚÂÊÔÇÃÕa-záéíóúâêôçãõ]+$/.test(w))
          if (allWordsAreNames) {
            const namePattern = /^[A-ZÁÉÍÓÚÂÊÔÇÃÕa-záéíóúâêôçãõ\s]+$/
            if (namePattern.test(nameCandidate) && nameCandidate.length > 5 && nameCandidate.length < 80) {
              return nameCandidate.trim()
            }
          }
        }
      }
    }
  }
  
  // Padrão 2: RG - Procura por "NOME" ou "NOME COMPLETO" seguido do nome
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase()
    
    if ((line.includes('NOME') && !line.includes('FILIAÇÃO') && !line.includes('FILIACAO')) || 
        line.includes('IDENTIDADE') || 
        line.includes('RG')) {
      
      // Verifica a linha seguinte
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim()
        
        // Remove datas e números do final
        let nameCandidate = nextLine.replace(/\s+\d{2}\/\d{2}\/\d{4}.*$/, '')
        nameCandidate = nameCandidate.replace(/\s+\d{8,}.*$/, '')
        nameCandidate = nameCandidate.replace(/^[^\w\s]+/, '').replace(/[^\w\s]+$/, '')
        nameCandidate = nameCandidate.replace(/\s+/g, ' ').trim()
        
        const words = nameCandidate.split(/\s+/).filter(w => w.length > 0 && !/^\d+$/.test(w))
        if (words.length >= 2 && words.length <= 6) {
          const allWordsAreNames = words.every(w => /^[A-ZÁÉÍÓÚÂÊÔÇÃÕa-záéíóúâêôçãõ]+$/.test(w))
          if (allWordsAreNames) {
            const namePattern = /^[A-ZÁÉÍÓÚÂÊÔÇÃÕa-záéíóúâêôçãõ\s]+$/
            if (namePattern.test(nameCandidate) && nameCandidate.length > 5 && nameCandidate.length < 80) {
              return nameCandidate.trim()
            }
          }
        }
      }
    }
  }
  
  // Padrão 3: Procura por linhas que parecem nomes (não começam com indicadores comuns)
  const excludedIndicators = [
    'REPÚBLICA', 'MINISTÉRIO', 'SECRETARIA', 'CARTEIRA', 'NACIONAL',
    'HABILITAÇÃO', 'HABILITACAO', 'DRIVER', 'LICENSE', 'PERMISO', 'CONDUCCIÓN',
    'NOME', 'SOBRENONE', 'SOBRENOME', 'DATA', 'LOCAL', 'UF',
    'NASCIMENTO', 'NASC', 'EMISSÃO', 'EMISSAO', 'VALIDADE', 'IDENTIDADE', 'ÓRG',
    'EMISSOR', 'BRASILEIRO', 'FILIAÇÃO', 'FILIACAO', 'NATURALIDADE', 'CATEGORIA',
    'REGISTRO', 'DOCUMENTO', 'CPF', 'RG', 'PORTADOR', 'TITULAR', 'TRANSPORTES'
  ]
  
  for (const line of lines) {
    const lineUpper = line.toUpperCase()
    const startsWithIndicator = excludedIndicators.some(indicator => 
      lineUpper.startsWith(indicator) || lineUpper.includes(indicator)
    )
    
    if (!startsWithIndicator && line.length > 8 && line.length < 80) {
      // Remove datas e números
      let nameCandidate = line.replace(/\s+\d{2}\/\d{2}\/\d{4}.*$/, '')
      nameCandidate = nameCandidate.replace(/\s+\d{8,}.*$/, '')
      nameCandidate = nameCandidate.replace(/^[^\w\s]+/, '').replace(/[^\w\s]+$/, '')
      nameCandidate = nameCandidate.replace(/\s+/g, ' ').trim()
      
      const words = nameCandidate.split(/\s+/).filter(w => w.length > 0 && !/^\d+$/.test(w))
      if (words.length >= 2 && words.length <= 6) {
        const allWordsAreNames = words.every(w => /^[A-ZÁÉÍÓÚÂÊÔÇÃÕa-záéíóúâêôçãõ]+$/.test(w))
        if (allWordsAreNames) {
          const namePattern = /^[A-ZÁÉÍÓÚÂÊÔÇÃÕa-záéíóúâêôçãõ\s]+$/
          if (namePattern.test(nameCandidate) && nameCandidate.length > 5) {
            // Verifica se não é uma data ou número
            if (!/^\d+/.test(nameCandidate) && !nameCandidate.match(/^\d{2}\/\d{2}\/\d{4}/)) {
              return nameCandidate.trim()
            }
          }
        }
      }
    }
  }
  
  return null
}

/**
 * Função principal que extrai dados do documento
 */
export async function extractDocumentData(imageSrc) {
  console.log('Iniciando extração de texto...')
  const rawText = await extractTextFromImage(imageSrc)
  console.log('Texto extraído:', rawText)
  
  const nome = extractName(rawText)
  const cpf = extractCPF(rawText)
  const dataNascimento = extractDateOfBirth(rawText)
  
  return {
    nome: nome || null,
    cpf: cpf || null,
    dataNascimento: dataNascimento || null,
    rawText: rawText
  }
}
