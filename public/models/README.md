# Modelos do Face-API.js

Para o reconhecimento facial funcionar, você precisa baixar os modelos do face-api.js e colocá-los nesta pasta.

## Como baixar os modelos:

1. Acesse: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Baixe os seguintes arquivos:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`

3. Coloque todos os arquivos nesta pasta (`public/models/`)

## Alternativa (CDN):

Se os modelos não estiverem disponíveis localmente, o sistema tentará carregá-los automaticamente do CDN do GitHub.
