export interface WuzapiInstance {
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

export interface WuzapiResponse {
  code: number;
  data: WuzapiInstance[];
  success: boolean;
}

export interface MessageStatus {
  from: string;
  to: string;
  sent: boolean;
}

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  LOCATION = 'location'
}

export enum MessageSequence {
  MEDIA_ONLY = 'media_only',
  MEDIA_THEN_TEXT = 'media_then_text',
  TEXT_THEN_MEDIA = 'text_then_media'
}

export interface ConversationContext {
  participants: string[];
  lastMessageTime: Date;
  messageCount: number;
  topic?: string;
  mood?: 'casual' | 'formal' | 'friendly' | 'neutral';
  isActive: boolean;
}

export interface PersonalityProfile {
  id: string;
  name: string;
  description: string;
  messageFrequency: {
    min: number;    // Intervalo mínimo entre mensagens (ms)
    max: number;    // Intervalo máximo entre mensagens (ms)
    peak: number;   // Intervalo mais provável (ms)
  };
  mediaPreferences: {
    [key in MessageType]: number; // Probabilidade de usar cada tipo de mídia (0-1)
  };
  vocabulary: string[];           // Palavras/frases características
  behaviorTraits: {
    responseChance: number;              // Chance de responder a uma mensagem (0-1)
    initiateConversationChance: number;  // Chance de iniciar conversa (0-1)
    sendMultipleMessages: number;        // Chance de enviar múltiplas mensagens seguidas (0-1)
    useEmojis: number;                   // Chance de usar emojis (0-1)
    sendVoiceMessages: number;           // Chance de enviar áudios (0-1)
  };
  activeHours: {
    start: number;  // Hora de início da atividade (0-23)
    end: number;    // Hora de fim da atividade (0-23)
  };
}