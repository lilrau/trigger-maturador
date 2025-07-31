import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { messageLogger, MessageLogger } from './logger';

// Carrega variáveis de ambiente
dotenv.config();

interface WuzapiInstance {
  id: string;
  jid: string;
  name: string;
  token: string;
  connected: boolean;
  loggedIn: boolean;
  events: string;
  expiration: number;
  proxy_url: string;
  qrcode: string;
  webhook: string;
}

interface WuzapiResponse {
  code: number;
  data: WuzapiInstance[];
  success: boolean;
}

interface MessageStatus {
  from: string;
  to: string;
  sent: boolean;
}

enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  LOCATION = 'location'
}

enum MessageSequence {
  MEDIA_ONLY = 'media_only',
  MEDIA_THEN_TEXT = 'media_then_text',
  TEXT_THEN_MEDIA = 'text_then_media'
}

const MESSAGE_DICTIONARY = [
  "Tô de boa por aqui 😌",
  "Esperando o próximo passo...",
  "Dá pra ir, confia 👍",
  "Mais um dia, mais uma maturação!",
  "Tá quase lá, calma aí! ⏳",
  "Preciso de um café ☕",
  "Eita, deu ruim aqui! 😳",
  "A fila andou, passou!",
  "Acordei inspirado hoje 😃",
  "Aguardando aquela ajudinha básica",
  "Só esperando o sinal verde! 🟢",
  "Hoje tá devagar, mas vai hein",
  "De olho em tudo, só observando 👀",
  "Podia estar em casa dormindo, confesso 😴",
  "Já acabou? Não, ainda não...",
  "Senti um cheirinho de vitória! 🏆",
  "Bora maturar mais um pouco!",
  "Rodando liso, sem stress",
  "Preciso de férias já! 🏖️",
  "Acho que vi um bug passando 🐛",
  "Fazendo hora extra aqui",
  "Tô pronto, chama!",
  "Só quero paz 😇",
  "Dia agitado hoje!",
  "Diz pra mim que tá tudo certo 👌",
  "Esperava menos trabalho hoje 😅",
  "E agora, José?",
  "Deu tilte, apaixonei 🫠",
  "Podia estar melhor, mas tá bom",
  "Só vai com música boa 🎶",
  "Tá frio aqui dentro 🥶",
  "Aquecendo os motores...",
  "Partiu descanso?",
  "Já acabou, Jéssica?",
  "Se der ruim, nem fui eu!",
  "Entrando no clima de maturação",
  "Segura aí que vai!",
  "Só na torcida pra dar tudo certo 🫡",
  "Olha eu aqui de novo!",
  "Acordando lentamente...",
  "Hoje o dia promete!",
  "Quase lá, juro!",
  "Olha a responsa!",
  "Tô esperando... e esperando...",
  "Paz e amor, só vibrações positivas ✌️",
  "Me chama que eu vou!",
  "Seguimos firmes 💪",
  "A vida é feita de ciclos, esse é só mais um",
  "Solta o som na caixa DJ! 🎵",
  "Vambora, que atrás vem gente!"
];

function getRandomMessage(): string {
  const idx = Math.floor(Math.random() * MESSAGE_DICTIONARY.length);
  return MESSAGE_DICTIONARY[idx];
}

class TriggerMaturador {
  private apiClient: AxiosInstance;
  private baseUrl: string;
  private token?: string;
  private minInterval: number;
  private maxInterval: number;
  private conversationHistory: Set<string> = new Set();
  private base64MediaPath: string;
  private logger: MessageLogger;
  private instanceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.baseUrl = process.env.WUZAPI_BASE_URL || 'https://wuzapi.ugui.tech';
    this.token = process.env.WUZAPI_ADMIN_TOKEN;
    this.minInterval = parseInt(process.env.MIN_INTERVAL || '40000'); // 40 segundos
    this.maxInterval = parseInt(process.env.MAX_INTERVAL || '250000'); // 250 segundos
    this.base64MediaPath = path.resolve(process.env.BASE64_MEDIA_PATH || './base64_media');
    
    // Inicializa o logger
    const logDir = process.env.LOG_DIR || './logs';
    this.logger = messageLogger;
    console.log(`Logger inicializado. Logs serão salvos em: ${this.logger.getLogFilePath()}`);
    
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Busca todas as instâncias conectadas na wuzapi
   */
  async getConnectedInstances(): Promise<WuzapiInstance[]> {
    try {
      console.log('Buscando instâncias conectadas...');
      const response = await this.apiClient.get<WuzapiResponse>('/admin/users', {
        headers: {
          'Authorization': this.token
        }
      });
      
      if (response.data.success) {
        // Filtra apenas instâncias conectadas, logadas e cujo nome começa com 'matura'
        return response.data.data.filter((instance: WuzapiInstance) =>
          instance.connected &&
          instance.loggedIn &&
          instance.name &&
          instance.name.toLowerCase().startsWith('matura')
        );
      } else {
        throw new Error('Falha ao buscar instâncias da wuzapi');
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      throw error;
    }
  }

  /**
   * Extrai o número de telefone do JID do WhatsApp
   */
  private extractPhoneFromJid(jid: string): string {
    // JID formato: "5491155551122:12@s.whatsapp.net"
    // Extrai apenas o número antes do ":"
    return jid.split(':')[0];
  }
  
  /**
   * Obtém o número de telefone a partir do token da instância
   */
  private async getPhoneFromToken(token: string): Promise<string> {
    try {
      // Busca todas as instâncias
      const instances = await this.getConnectedInstances();
      
      // Encontra a instância com o token correspondente
      const instance = instances.find(inst => inst.token === token);
      
      if (instance) {
        return this.extractPhoneFromJid(instance.jid);
      }
      
      return 'unknown';
    } catch (error) {
      console.error('Erro ao obter número de telefone a partir do token:', error);
      return 'unknown';
    }
  }

  /**
   * Seleciona aleatoriamente um tipo de mensagem
   */
  private getRandomMessageType(): MessageType {
    const types = Object.values(MessageType);
    const idx = Math.floor(Math.random() * types.length);
    return types[idx];
  }
  
  /**
   * Seleciona aleatoriamente uma sequência de mensagens
   */
  private getRandomMessageSequence(): MessageSequence {
    const sequences = Object.values(MessageSequence);
    const idx = Math.floor(Math.random() * sequences.length);
    return sequences[idx];
  }

  /**
   * Lê um item aleatório de um arquivo JSON sem carregar o arquivo inteiro
   * @param type Tipo de mídia (audio, image, video, document, sticker, location)
   * @returns Uma string base64 aleatória do arquivo ou objeto de localização
   */
  private async getRandomBase64(type: string): Promise<string | any> {
    try {
      // Tratamento especial para localização
      if (type === 'location') {
        // Usar o arquivo location.js para gerar coordenadas aleatórias
        const locationJsPath = path.join(this.base64MediaPath, 'location.js');
        
        if (!fs.existsSync(locationJsPath)) {
          console.error(`Arquivo ${locationJsPath} não encontrado`);
          return '';
        }
        
        // Ler o conteúdo do arquivo location.js
        const locationJsContent = fs.readFileSync(locationJsPath, 'utf8');
        
        // Executar o código JavaScript para obter coordenadas aleatórias
        // Usando Function para criar um contexto isolado
        const locationFn = new Function(locationJsContent);
        const locationData = locationFn();
        
        // Retornar o primeiro item (ou um aleatório se houver mais)
        const randomLocation = locationData[Math.floor(Math.random() * locationData.length)];
        return randomLocation.json;
      }
      
      const filePath = path.join(this.base64MediaPath, `${type}.json`);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        console.error(`Arquivo ${filePath} não encontrado`);
        return '';
      }

      // Ler o tamanho do arquivo
      const stats = fs.statSync(filePath);
      
      // Abrir o arquivo para leitura
      const fd = fs.openSync(filePath, 'r');
      
      // Ler os primeiros 100 bytes para determinar a estrutura do JSON
      const buffer = Buffer.alloc(100);
      fs.readSync(fd, buffer, 0, 100, 0);
      const start = buffer.toString().indexOf('[');
      
      if (start === -1) {
        fs.closeSync(fd);
        throw new Error(`Formato inválido no arquivo ${filePath}`);
      }
      
      // Ler uma pequena parte do arquivo para contar quantos itens existem
      // Isso é uma estimativa, não é preciso
      const sampleBuffer = Buffer.alloc(1000);
      fs.readSync(fd, sampleBuffer, 0, 1000, start);
      const sampleText = sampleBuffer.toString();
      
      // Contar aproximadamente quantos itens existem baseado na amostra
      const commaCount = (sampleText.match(/,/g) || []).length;
      const estimatedItems = Math.max(5, commaCount); // Pelo menos 5 itens
      
      // Escolher um índice aleatório
      const randomIndex = Math.floor(Math.random() * estimatedItems);
      
      // Tentar encontrar o item no índice escolhido
      let currentIndex = 0;
      let currentPos = start + 1; // Pular o '['
      let itemStart = -1;
      let itemEnd = -1;
      let inQuote = false;
      let escaping = false;
      
      // Ler o arquivo em chunks para encontrar o item desejado
      const chunkSize = 1024;
      const chunk = Buffer.alloc(chunkSize);
      
      while (currentPos < stats.size) {
        const bytesRead = fs.readSync(fd, chunk, 0, chunkSize, currentPos);
        if (bytesRead === 0) break;
        
        for (let i = 0; i < bytesRead; i++) {
          const char = String.fromCharCode(chunk[i]);
          
          if (escaping) {
            escaping = false;
            continue;
          }
          
          if (char === '\\') {
            escaping = true;
            continue;
          }
          
          if (char === '"') {
            inQuote = !inQuote;
            if (inQuote && itemStart === -1 && currentIndex === randomIndex) {
              itemStart = currentPos + i + 1; // Início do conteúdo da string
            } else if (!inQuote && itemStart !== -1 && itemEnd === -1) {
              itemEnd = currentPos + i; // Fim do conteúdo da string
              break;
            }
            continue;
          }
          
          if (!inQuote && char === ',') {
            currentIndex++;
          }
        }
        
        if (itemEnd !== -1) break;
        currentPos += bytesRead;
      }
      
      fs.closeSync(fd);
      
      if (itemStart === -1 || itemEnd === -1) {
        console.error(`Não foi possível encontrar um item válido no arquivo ${filePath}`);
        return '';
      }
      
      // Ler o item encontrado
      const itemLength = itemEnd - itemStart;
      const itemBuffer = Buffer.alloc(itemLength);
      const itemFd = fs.openSync(filePath, 'r');
      fs.readSync(itemFd, itemBuffer, 0, itemLength, itemStart);
      fs.closeSync(itemFd);
      
      return itemBuffer.toString();
    } catch (error) {
      console.error(`Erro ao ler base64 para ${type}:`, error);
      return '';
    }
  }

  /**
   * Envia uma mensagem de mídia
   */
  private async sendMediaMessage(fromInstanceToken: string, toPhone: string, messageType: MessageType): Promise<boolean> {
    try {
      let endpoint = '';
      let payload: any = {
        Phone: toPhone,
        Id: `MSG_${Date.now()}` // ID único para a mensagem
      };
      
      switch (messageType) {
        case MessageType.AUDIO:
          endpoint = '/chat/send/audio';
          const audioBase64 = await this.getRandomBase64('audio');
          if (!audioBase64) return false;
          payload.Audio = `data:audio/ogg;base64,${audioBase64}`;
          break;
          
        case MessageType.IMAGE:
          endpoint = '/chat/send/image';
          const imageBase64 = await this.getRandomBase64('image');
          if (!imageBase64) return false;
          payload.Image = `data:image/jpeg;base64,${imageBase64}`;
          payload.Caption = 'Imagem enviada pelo maturador';
          break;
          
        case MessageType.VIDEO:
          endpoint = '/chat/send/video';
          const videoBase64 = await this.getRandomBase64('video');
          if (!videoBase64) return false;
          payload.Video = `data:video/mp4;base64,${videoBase64}`;
          payload.Caption = 'Vídeo enviado pelo maturador';
          break;
          
        case MessageType.DOCUMENT:
          endpoint = '/chat/send/document';
          const docBase64 = await this.getRandomBase64('document');
          if (!docBase64) return false;
          payload.Document = `data:application/octet-stream;base64,${docBase64}`;
          payload.FileName = `documento_${Date.now()}.txt`;
          break;
          
        case MessageType.STICKER:
          endpoint = '/chat/send/sticker';
          const stickerBase64 = await this.getRandomBase64('sticker');
          if (!stickerBase64) return false;
          payload.Sticker = `data:image/webp;base64,${stickerBase64}`;
          break;
          
        case MessageType.LOCATION:
          endpoint = '/chat/send/location';
          // Obter localização aleatória do arquivo JS
          const locationData = await this.getRandomBase64('location');
          if (!locationData) return false;
          
          // Usar os dados de localização gerados pelo location.js
          payload.Latitude = parseFloat(locationData.latitude);
          payload.Longitude = parseFloat(locationData.longitude);
          payload.Name = locationData.name || "Location";
          
          console.log(`Enviando localização: Lat ${payload.Latitude}, Long ${payload.Longitude}`);
          break;
          
        default:
          return false; // Tipo de mídia não suportado
      }
      
      const response = await this.apiClient.post(endpoint, payload, {
        headers: {
          'token': fromInstanceToken
        }
      });
      
      const success = response.status === 200;
      
      // Obter o número de telefone do remetente a partir do token
      const fromPhone = await this.getPhoneFromToken(fromInstanceToken);
      
      // Registrar no log
      let details = '';
      if (messageType === MessageType.LOCATION && payload.Name) {
        details = `Nome: ${payload.Name}, Lat: ${payload.Latitude}, Long: ${payload.Longitude}`;
      } else if (payload.Caption) {
        details = `Legenda: ${payload.Caption}`;
      } else if (payload.FileName) {
        details = `Arquivo: ${payload.FileName}`;
      }
      
      this.logger.logMediaMessage(fromPhone, toPhone, messageType, success, details);
      
      return success;
    } catch (error) {
      console.error(`Erro ao enviar mídia para ${toPhone}:`, error);
      this.logger.logError(`Envio de mídia ${messageType} para ${toPhone}`, error);
      return false;
    }
  }
  
  /**
   * Envia uma mensagem de texto
   */
  private async sendTextMessage(fromInstanceToken: string, toPhone: string, textMessage: string): Promise<boolean> {
    try {
      const payload = {
        Phone: toPhone,
        Body: textMessage,
        Id: `MSG_${Date.now()}` // ID único para a mensagem
      };
      
      const response = await this.apiClient.post('/chat/send/text', payload, {
        headers: {
          'token': fromInstanceToken
        }
      });
      
      const success = response.status === 200;
      
      // Obter o número de telefone do remetente a partir do token
      const fromPhone = await this.getPhoneFromToken(fromInstanceToken);
      
      // Registrar no log
      this.logger.logTextMessage(fromPhone, toPhone, textMessage, success);
      
      return success;
    } catch (error) {
      console.error(`Erro ao enviar texto para ${toPhone}:`, error);
      this.logger.logError(`Envio de texto para ${toPhone}`, error);
      return false;
    }
  }

  /**
   * Envia uma mensagem de uma instância para outra com tipo e sequência aleatórios
   */
  async sendMessage(fromInstanceToken: string, toPhone: string, textMessage: string): Promise<boolean> {
    try {
      // Seleciona aleatoriamente uma sequência de mensagens
      const messageSequence = this.getRandomMessageSequence();
      console.log(`Enviando mensagem com sequência ${messageSequence} para ${toPhone}`);
      
      // Obter o número de telefone do remetente a partir do token
      const fromPhone = await this.getPhoneFromToken(fromInstanceToken);
      
      // Registrar no log o início da sequência
      this.logger.logMessageSequence(fromPhone, toPhone, messageSequence);
      
      // Seleciona aleatoriamente um tipo de mídia (exceto texto)
      const mediaTypes = Object.values(MessageType).filter(type => type !== MessageType.TEXT);
      const randomMediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)] as MessageType;
      
      let success = false;
      
      switch (messageSequence) {
        case MessageSequence.MEDIA_ONLY:
          // Envia apenas mídia
          success = await this.sendMediaMessage(fromInstanceToken, toPhone, randomMediaType);
          console.log(`Enviado apenas mídia (${randomMediaType}) para ${toPhone}: ${success ? 'Sucesso' : 'Falha'}`);
          break;
          
        case MessageSequence.MEDIA_THEN_TEXT:
          // Envia mídia primeiro
          success = await this.sendMediaMessage(fromInstanceToken, toPhone, randomMediaType);
          console.log(`Enviado mídia (${randomMediaType}) para ${toPhone}: ${success ? 'Sucesso' : 'Falha'}`);
          
          // Se a mídia foi enviada com sucesso, aguarda um pouco e envia texto
          if (success) {
            // Aguarda entre 5 e 15 segundos antes de enviar o texto
            const waitTime = 5000 + Math.floor(Math.random() * 10000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            const textSuccess = await this.sendTextMessage(fromInstanceToken, toPhone, textMessage);
            console.log(`Enviado texto após mídia para ${toPhone}: ${textSuccess ? 'Sucesso' : 'Falha'}`);
            
            // Considera sucesso se pelo menos a mídia foi enviada
          }
          break;
          
        case MessageSequence.TEXT_THEN_MEDIA:
          // Envia texto primeiro
          success = await this.sendTextMessage(fromInstanceToken, toPhone, textMessage);
          console.log(`Enviado texto para ${toPhone}: ${success ? 'Sucesso' : 'Falha'}`);
          
          // Se o texto foi enviado com sucesso, aguarda um pouco e envia mídia
          if (success) {
            // Aguarda entre 5 e 15 segundos antes de enviar a mídia
            const waitTime = 5000 + Math.floor(Math.random() * 10000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            const mediaSuccess = await this.sendMediaMessage(fromInstanceToken, toPhone, randomMediaType);
            console.log(`Enviado mídia (${randomMediaType}) após texto para ${toPhone}: ${mediaSuccess ? 'Sucesso' : 'Falha'}`);
            
            // Considera sucesso se pelo menos o texto foi enviado
          }
          break;
          
        default:
          // Caso padrão: envia apenas texto
          success = await this.sendTextMessage(fromInstanceToken, toPhone, textMessage);
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${toPhone}:`, error);
      return false;
    }
  }

  /**
   * Verifica se já existe conversa entre duas instâncias
   */
  private hasConversation(phone1: string, phone2: string): boolean {
    const key1 = `${phone1}-${phone2}`;
    const key2 = `${phone2}-${phone1}`;
    return this.conversationHistory.has(key1) || this.conversationHistory.has(key2);
  }

  /**
   * Marca uma conversa como existente
   */
  private markConversation(phone1: string, phone2: string): void {
    const key = `${phone1}-${phone2}`;
    this.conversationHistory.add(key);
  }

  /**
   * Inicia o timer individual para uma instância específica
   */
  private startInstanceTimer(instance: WuzapiInstance): void {
    const instanceId = instance.id;
    
    // Se já existe um timer para esta instância, cancela
    if (this.instanceTimers.has(instanceId)) {
      clearTimeout(this.instanceTimers.get(instanceId)!);
    }
    
    // Calcula intervalo aleatório para esta instância
    const interval = Math.floor(Math.random() * (this.maxInterval - this.minInterval + 1)) + this.minInterval;
    
    console.log(`⏰ Timer iniciado para ${instance.name} (${this.extractPhoneFromJid(instance.jid)}): ${interval / 1000}s`);
    
    const timer = setTimeout(async () => {
      if (this.isRunning) {
        await this.processInstanceMessage(instance);
        // Reinicia o timer para a próxima execução
        this.startInstanceTimer(instance);
      }
    }, interval);
    
    this.instanceTimers.set(instanceId, timer);
  }

  /**
   * Processa o envio de mensagem para uma instância específica
   */
  private async processInstanceMessage(instance: WuzapiInstance): Promise<void> {
    try {
      console.log(`\n🔄 Processando mensagem para instância: ${instance.name}`);
      
      // Busca todas as instâncias conectadas novamente
      const allInstances = await this.getConnectedInstances();
      
      if (allInstances.length < 2) {
        console.log('Menos de 2 instâncias conectadas, pulando...');
        return;
      }
      
      // Seleciona uma instância de destino aleatória (diferente da atual)
      let targetInstance: WuzapiInstance;
      do {
        const randomIndex = Math.floor(Math.random() * allInstances.length);
        targetInstance = allInstances[randomIndex];
      } while (targetInstance.id === instance.id);
      
      const fromPhone = this.extractPhoneFromJid(instance.jid);
      const toPhone = this.extractPhoneFromJid(targetInstance.jid);
      
      console.log(`📤 ${instance.name} (${fromPhone}) → ${targetInstance.name} (${toPhone})`);
      
      // Sorteia uma mensagem aleatória
      const randomMessage = getRandomMessage();
      
      // Envia a mensagem
      const success = await this.sendMessage(instance.token, toPhone, randomMessage);
      
      if (success) {
        console.log(`✅ Mensagem enviada com sucesso: ${fromPhone} → ${toPhone}`);
        this.logger.logTextMessage(fromPhone, toPhone, randomMessage, true);
      } else {
        console.log(`❌ Falha ao enviar mensagem: ${fromPhone} → ${toPhone}`);
        this.logger.logTextMessage(fromPhone, toPhone, randomMessage, false);
      }
      
    } catch (error) {
      console.error(`Erro ao processar mensagem para instância ${instance.name}:`, error);
      this.logger.logError(`Processamento de instância ${instance.name}`, error);
    }
  }

  /**
   * Para todos os timers ativos
   */
  private stopAllTimers(): void {
    console.log('🛑 Parando todos os timers...');
    this.instanceTimers.forEach((timer, instanceId) => {
      clearTimeout(timer);
      console.log(`Timer parado para instância ${instanceId}`);
    });
    this.instanceTimers.clear();
  }

  /**
   * Executa o processo principal: inicia timers individuais para cada instância
   */
  async executeTrigger(): Promise<void> {
    try {
      console.log('🚀 Iniciando trigger maturador com timers individuais...');
      console.log(`Logs serão salvos em: ${this.logger.getLogFilePath()}`);
      
      this.isRunning = true;
      
      // Função para gerenciar as instâncias
      const manageInstances = async () => {
        try {
          const instances = await this.getConnectedInstances();
          console.log(`\n📊 Encontradas ${instances.length} instâncias conectadas`);
          
          if (instances.length < 2) {
            console.log('⚠️ Necessário pelo menos 2 instâncias conectadas');
            return;
          }
          
          // Para timers de instâncias que não estão mais conectadas
          this.instanceTimers.forEach((timer, instanceId) => {
            const stillConnected = instances.some(inst => inst.id === instanceId);
            if (!stillConnected) {
              console.log(`🛑 Instância ${instanceId} desconectada, parando timer`);
              clearTimeout(timer);
              this.instanceTimers.delete(instanceId);
            }
          });
          
          // Inicia timers para novas instâncias
          instances.forEach(instance => {
            if (!this.instanceTimers.has(instance.id)) {
              console.log(`🎯 Iniciando timer para nova instância: ${instance.name}`);
              this.startInstanceTimer(instance);
            }
          });
          
          console.log(`⏱️ Total de timers ativos: ${this.instanceTimers.size}`);
          
        } catch (error) {
          console.error('Erro ao gerenciar instâncias:', error);
          this.logger.logError('Gerenciamento de instâncias', error);
        }
      };
      
      // Executa gerenciamento inicial
      await manageInstances();
      
      // Configura verificação periódica de novas instâncias (a cada 5 minutos)
      const instanceCheckInterval = setInterval(async () => {
        if (this.isRunning) {
          await manageInstances();
        } else {
          clearInterval(instanceCheckInterval);
        }
      }, 5 * 60 * 1000); // 5 minutos
      
      // Mantém o processo rodando
      console.log('🔄 Sistema de timers individuais ativo. Pressione Ctrl+C para parar.');
      
      // Aguarda indefinidamente
      await new Promise(() => {});
      
    } catch (error) {
      console.error('Erro fatal durante execução do trigger:', error);
      this.isRunning = false;
      this.stopAllTimers();
      throw error;
    }
  }

  /**
   * Função auxiliar para aguardar um tempo aleatório entre minInterval e maxInterval
   */
  private async randomSleep(): Promise<void> {
    const ms = Math.floor(Math.random() * (this.maxInterval - this.minInterval + 1)) + this.minInterval;
    console.log(`Aguardando ${ms / 1000} segundos antes do próximo envio...`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Execução principal
async function main() {
  const trigger = new TriggerMaturador();
  
  // Configura tratamento de interrupção (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n🛑 Interrupção detectada. Parando todos os timers...');
    trigger['isRunning'] = false;
    trigger['stopAllTimers']();
    process.exit(0);
  });
  
  try {
    await trigger.executeTrigger();
  } catch (error) {
    console.error('Erro fatal:', error);
    process.exit(1);
  }
}

// Executa apenas se este arquivo for chamado diretamente
if (require.main === module) {
  main();
}

export { TriggerMaturador };