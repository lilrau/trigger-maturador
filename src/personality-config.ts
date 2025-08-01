import { PersonalityProfile, MessageType } from './types';

export const PERSONALITY_PROFILES: PersonalityProfile[] = [
  {
    id: 'casual_frequent',
    name: 'Comunicativo',
    description: 'Pessoa que gosta de conversar e envia mensagens frequentemente',
    messageFrequency: {
      min: 30000,  // 30 segundos
      max: 120000, // 2 minutos
      peak: 60000  // 1 minuto
    },
    mediaPreferences: {
      [MessageType.TEXT]: 0.4,
      [MessageType.AUDIO]: 0.15,
      [MessageType.IMAGE]: 0.2,
      [MessageType.VIDEO]: 0.1,
      [MessageType.DOCUMENT]: 0.05,
      [MessageType.STICKER]: 0.1,
      [MessageType.LOCATION]: 0.0
    },
    vocabulary: [
      'Oi!', 'Olá!', 'E aí?', 'Tudo bem?', 'Como vai?',
      'Que legal!', 'Interessante!', 'Verdade!', 'Concordo!',
      'Haha', 'rsrs', 'kkk', 'Legal!', 'Show!',
      'Valeu!', 'Obrigado!', 'De nada!', 'Imagina!',
      'Até mais!', 'Tchau!', 'Falou!', 'Abraço!'
    ],
    behaviorTraits: {
      responseChance: 0.8,
      initiateConversationChance: 0.6,
      sendMultipleMessages: 0.4,
      useEmojis: 0.7,
      sendVoiceMessages: 0.3
    },
    activeHours: {
      start: 7,  // 7h
      end: 23    // 23h
    }
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Pessoa mais formal e objetiva nas comunicações',
    messageFrequency: {
      min: 300000,  // 5 minutos
      max: 1800000, // 30 minutos
      peak: 900000  // 15 minutos
    },
    mediaPreferences: {
      [MessageType.TEXT]: 0.6,
      [MessageType.AUDIO]: 0.05,
      [MessageType.IMAGE]: 0.1,
      [MessageType.VIDEO]: 0.05,
      [MessageType.DOCUMENT]: 0.2,
      [MessageType.STICKER]: 0.0,
      [MessageType.LOCATION]: 0.0
    },
    vocabulary: [
      'Bom dia!', 'Boa tarde!', 'Boa noite!',
      'Prezado', 'Caro', 'Cordialmente',
      'Obrigado pela informação', 'Entendi',
      'Vou verificar', 'Confirmo', 'Perfeito',
      'Att.', 'Abraços', 'Saudações'
    ],
    behaviorTraits: {
      responseChance: 0.9,
      initiateConversationChance: 0.3,
      sendMultipleMessages: 0.1,
      useEmojis: 0.1,
      sendVoiceMessages: 0.1
    },
    activeHours: {
      start: 8,  // 8h
      end: 18    // 18h
    }
  },
  {
    id: 'night_owl',
    name: 'Noturno',
    description: 'Pessoa mais ativa durante a noite',
    messageFrequency: {
      min: 120000,  // 2 minutos
      max: 600000,  // 10 minutos
      peak: 300000  // 5 minutos
    },
    mediaPreferences: {
      [MessageType.TEXT]: 0.3,
      [MessageType.AUDIO]: 0.2,
      [MessageType.IMAGE]: 0.25,
      [MessageType.VIDEO]: 0.15,
      [MessageType.DOCUMENT]: 0.0,
      [MessageType.STICKER]: 0.1,
      [MessageType.LOCATION]: 0.0
    },
    vocabulary: [
      'Opa!', 'Fala aí!', 'Beleza?', 'Suave?',
      'Massa!', 'Dahora!', 'Sinistro!', 'Top!',
      'Relaxa', 'Tranquilo', 'De boa', 'Sussa',
      'Tmj', 'Vlw', 'Flw', 'Abs'
    ],
    behaviorTraits: {
      responseChance: 0.7,
      initiateConversationChance: 0.5,
      sendMultipleMessages: 0.6,
      useEmojis: 0.8,
      sendVoiceMessages: 0.4
    },
    activeHours: {
      start: 20,  // 20h
      end: 6      // 6h (madrugada)
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Pessoa que prefere mensagens curtas e diretas',
    messageFrequency: {
      min: 600000,   // 10 minutos
      max: 3600000,  // 1 hora
      peak: 1800000  // 30 minutos
    },
    mediaPreferences: {
      [MessageType.TEXT]: 0.8,
      [MessageType.AUDIO]: 0.05,
      [MessageType.IMAGE]: 0.1,
      [MessageType.VIDEO]: 0.0,
      [MessageType.DOCUMENT]: 0.05,
      [MessageType.STICKER]: 0.0,
      [MessageType.LOCATION]: 0.0
    },
    vocabulary: [
      'Ok', 'Sim', 'Não', 'Certo', 'Entendi',
      'Blz', 'Vlw', 'Obg', 'Tmj', 'Flw',
      'Oi', 'Tchau', 'Até', 'Fala', 'Opa'
    ],
    behaviorTraits: {
      responseChance: 0.6,
      initiateConversationChance: 0.2,
      sendMultipleMessages: 0.1,
      useEmojis: 0.2,
      sendVoiceMessages: 0.1
    },
    activeHours: {
      start: 9,   // 9h
      end: 22     // 22h
    }
  },
  {
    id: 'social_butterfly',
    name: 'Social',
    description: 'Pessoa muito sociável que adora compartilhar conteúdo',
    messageFrequency: {
      min: 60000,   // 1 minuto
      max: 300000,  // 5 minutos
      peak: 180000  // 3 minutos
    },
    mediaPreferences: {
      [MessageType.TEXT]: 0.2,
      [MessageType.AUDIO]: 0.2,
      [MessageType.IMAGE]: 0.3,
      [MessageType.VIDEO]: 0.2,
      [MessageType.DOCUMENT]: 0.0,
      [MessageType.STICKER]: 0.1,
      [MessageType.LOCATION]: 0.0
    },
    vocabulary: [
      'Gente!', 'Pessoal!', 'Galera!', 'Amores!',
      'Que incrível!', 'Amei!', 'Perfeito!', 'Maravilhoso!',
      'Compartilhando aqui', 'Olha só!', 'Vejam isso!',
      'Beijos!', 'Amo vocês!', 'Até logo!', 'Xoxo'
    ],
    behaviorTraits: {
      responseChance: 0.9,
      initiateConversationChance: 0.8,
      sendMultipleMessages: 0.7,
      useEmojis: 0.9,
      sendVoiceMessages: 0.5
    },
    activeHours: {
      start: 6,   // 6h
      end: 24     // 24h (quase o dia todo)
    }
  }
];

export const DEFAULT_PERSONALITY_WEIGHTS = {
  'casual_frequent': 0.3,
  'professional': 0.2,
  'night_owl': 0.2,
  'minimalist': 0.15,
  'social_butterfly': 0.15
};