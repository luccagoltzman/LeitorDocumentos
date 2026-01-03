# 📄 Leitor de Documentos

Uma aplicação React moderna que extrai automaticamente informações de documentos brasileiros (CNH ou RG) através de OCR (Reconhecimento Óptico de Caracteres).

## ✨ Funcionalidades

- 📁 **Upload de Imagens**: Faça upload de imagens de documentos já fotografados
- 📷 **Captura em Tempo Real**: Use a câmera do dispositivo para capturar documentos em tempo real
- 🔍 **Extração Automática**: Extrai automaticamente:
  - Nome completo
  - CPF
  - Data de nascimento
- 🎨 **Interface Moderna**: UI bonita e responsiva com design moderno

## 🚀 Como Usar

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse a aplicação no navegador (geralmente em `http://localhost:5173`)

### Uso

1. **Upload de Imagem**:
   - Clique na aba "Upload de Imagem"
   - Arraste uma imagem ou clique para selecionar
   - Clique em "Processar Documento"

2. **Captura em Tempo Real**:
   - Clique na aba "Captura em Tempo Real"
   - Clique em "Iniciar Câmera" (permita o acesso à câmera)
   - Posicione o documento na frente da câmera
   - Clique em "Capturar"
   - Clique em "Processar Documento"

3. **Visualizar Resultados**:
   - Os dados extraídos aparecerão automaticamente ao lado
   - Você pode expandir para ver o texto completo extraído pelo OCR

## 🛠️ Tecnologias Utilizadas

- **React 18**: Biblioteca JavaScript para construção de interfaces
- **Vite**: Build tool moderna e rápida
- **Tesseract.js**: Biblioteca JavaScript para OCR
- **React Webcam**: Componente React para captura de vídeo/câmera

## 📝 Notas

- A precisão da extração depende da qualidade da imagem
- Certifique-se de que o documento está bem iluminado e em foco
- O OCR funciona melhor com documentos em português
- A primeira execução pode demorar um pouco mais devido ao download dos modelos de OCR

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.
