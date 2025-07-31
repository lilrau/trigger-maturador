# Trigger Maturador

Script em TypeScript que automatiza o envio de mensagens entre instâncias do WhatsApp via wuzapi, com suporte a diferentes tipos de mídia (texto, áudio, imagem, vídeo, documento e sticker).

## Funcionalidades

- 🔍 Busca todas as instâncias conectadas na wuzapi
- 📱 Faz com que instâncias enviem mensagens entre si continuamente
- 🔄 Execução contínua com intervalos aleatórios entre 40 e 250 segundos
- 📊 Suporte a múltiplos tipos de mídia (texto, áudio, imagem, vídeo, documento, sticker, localização)
- 🔀 Três tipos de sequências de mensagens (apenas mídia, mídia seguida de texto, texto seguido de mídia)
- 💾 Leitura eficiente de arquivos base64 (sem carregar o arquivo inteiro na memória)
- ⏱️ Controle de intervalo entre mensagens para evitar spam
- 🛡️ Tratamento de erros e logs detalhados
- 📝 Sistema de log para histórico completo de mensagens enviadas

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env`:
```env
# URL base da API wuzapi
WUZAPI_BASE_URL=https://wuzapi.ugui.tech

# Token de autenticação (obrigatório)
WUZAPI_ADMIN_TOKEN=your_token_here

# Intervalo mínimo entre mensagens em milissegundos (padrão: 40 segundos)
MIN_INTERVAL=40000

# Intervalo máximo entre mensagens em milissegundos (padrão: 250 segundos)
MAX_INTERVAL=250000

# Caminho para a pasta com os arquivos base64
BASE64_MEDIA_PATH=./base64_media

# Diretório para salvar os logs (opcional)
LOG_DIR=./logs
```

4. Prepare os arquivos de mídia base64 na pasta `base64_media`:
   - Cada tipo de mídia deve ter seu próprio arquivo JSON (audio.json, image.json, video.json, document.json, sticker.json)
   - Os arquivos devem conter arrays de strings base64, por exemplo: `["YUASGdvas", "dahsuidhuia", ...]`
   - Para localização, use o arquivo location.js que gera coordenadas aleatórias:
      ```javascript
      // Latitude: de -90 a 90
      const latitude = (Math.random() * 180 - 90).toFixed(6); 
      
      // Longitude: de -180 a 180
      const longitude = (Math.random() * 360 - 180).toFixed(6); 
      
      return [
        {
          json: {
            latitude,
            longitude,
            name: "Location" // Opcional: você pode adicionar um nome
          }
        }
      ];
      ```

## Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Como funciona

1. O script busca todas as instâncias conectadas na wuzapi
2. Em um loop contínuo:
   - Seleciona aleatoriamente pares de instâncias
   - Escolhe aleatoriamente uma sequência de mensagens:
     * Apenas mídia (áudio, imagem, vídeo, documento ou sticker)
     * Mídia seguida de texto (com intervalo de 5-15 segundos entre eles)
     * Texto seguido de mídia (com intervalo de 5-15 segundos entre eles)
   - Para tipos de mídia, lê eficientemente um item aleatório do arquivo JSON correspondente
   - Envia a(s) mensagem(ns) de uma instância para outra seguindo a sequência escolhida
   - Aguarda um intervalo aleatório entre 40 e 250 segundos
   - Repete o processo indefinidamente
3. Exibe logs detalhados de cada mensagem enviada e ciclo concluído

## Endpoints Suportados

- `/chat/send/text` - Envio de mensagens de texto
- `/chat/send/audio` - Envio de mensagens de áudio
- `/chat/send/image` - Envio de mensagens com imagem
- `/chat/send/video` - Envio de mensagens com vídeo
- `/chat/send/document` - Envio de documentos
- `/chat/send/sticker` - Envio de stickers
- `/chat/send/location` - Envio de localização

## Sistema de Logs

O script inclui um sistema de logs que registra todas as mensagens enviadas e eventos importantes:

- Logs são salvos na pasta `./logs` (configurável via variável de ambiente `LOG_DIR`)
- Um arquivo de log é criado para cada dia no formato `messages-YYYY-MM-DD.log`
- Informações registradas:
  - Mensagens de texto enviadas (sucesso/falha)
  - Mensagens de mídia enviadas (sucesso/falha)
  - Sequências de mensagens iniciadas
  - Início e fim de cada ciclo de envio
  - Erros ocorridos durante a execução

### Formato dos Logs

```
[YYYY-MM-DD HH:mm:ss] [TIPO] [STATUS] De: TELEFONE_ORIGEM Para: TELEFONE_DESTINO | Detalhes
```

Exemplos:
```
[2023-11-10 14:30:45] [TEXTO] [SUCESSO] De: 5511999998888 Para: 5511999997777 | Mensagem: Tô de boa por aqui 😌
[2023-11-10 14:31:20] [IMAGEM] [SUCESSO] De: 5511999998888 Para: 5511999997777 | Legenda: Imagem enviada pelo maturador
[2023-11-10 14:32:10] [CICLO] Iniciando ciclo com 5 instâncias conectadas
[2023-11-10 14:40:15] [CICLO] Ciclo concluído com 3 mensagens enviadas
```

### Configuração

Adicione a seguinte variável ao seu arquivo `.env` para personalizar o diretório de logs:

```env
# Diretório para salvar os logs (padrão: ./logs)
LOG_DIR=./logs
```

## TODO

- [x] Implementar endpoints corretos da wuzapi
- [x] Adicionar suporte a múltiplos tipos de mídia
- [x] Implementar execução contínua com intervalos aleatórios
- [x] Adicionar sequências variadas de mensagens (mídia+texto, texto+mídia)
- [ ] Adicionar verificação de mensagens recebidas
- [x] Implementar sistema de logs para histórico de mensagens
- [ ] Melhorar tratamento de erros
- [ ] Adicionar testes unitários