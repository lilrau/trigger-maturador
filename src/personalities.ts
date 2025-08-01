import { PersonalityProfile, MessageType } from './types';
import { PERSONALITY_PROFILES, DEFAULT_PERSONALITY_WEIGHTS } from './personality-config';

export class PersonalityManager {
  private personalities: PersonalityProfile[] = [];
  private instancePersonalities: Map<string, string> = new Map(); // instanceId -> personalityId

  constructor() {
    this.initializePersonalities();
  }

  /**
   * Inicializa as personalidades pré-definidas
   */
  private initializePersonalities(): void {
    this.personalities = [...PERSONALITY_PROFILES];
    console.log(`✅ ${this.personalities.length} personalidades inicializadas`);
  }

  /**
   * Atribui personalidades às instâncias de forma dinâmica
   */
  assignPersonalities(instanceIds: string[]): void {
    // Remove personalidades de instâncias que não existem mais
    const currentInstanceIds = new Set(instanceIds);
    for (const [instanceId] of this.instancePersonalities) {
      if (!currentInstanceIds.has(instanceId)) {
        this.instancePersonalities.delete(instanceId);
      }
    }

    // Atribui personalidades para novas instâncias
    for (const instanceId of instanceIds) {
      if (!this.instancePersonalities.has(instanceId)) {
        this.assignPersonality(instanceId);
      }
    }
  }

  /**
   * Atribui uma personalidade aleatória a uma instância baseada nos pesos
   */
  assignPersonality(instanceId: string): PersonalityProfile | null {
    // Remove personalidade anterior se existir
    this.instancePersonalities.delete(instanceId);
    
    // Seleciona personalidade baseada nos pesos
    const selectedPersonality = this.selectPersonalityByWeight();
    if (!selectedPersonality) {
      console.error(`❌ Erro ao selecionar personalidade para instância ${instanceId}`);
      return null;
    }
    
    // Atribui à instância
    this.instancePersonalities.set(instanceId, selectedPersonality.id);
    
    console.log(`🎭 Personalidade "${selectedPersonality.name}" atribuída à instância ${instanceId}`);
    
    return selectedPersonality;
  }

  /**
   * Seleciona uma personalidade baseada nos pesos configurados
   */
  private selectPersonalityByWeight(): PersonalityProfile | null {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const personality of this.personalities) {
      const weight = (DEFAULT_PERSONALITY_WEIGHTS as any)[personality.id] || 0;
      cumulativeWeight += weight;
      
      if (random <= cumulativeWeight) {
        return personality;
      }
    }
    
    // Fallback: retorna a primeira personalidade se algo der errado
    return this.personalities[0] || null;
  }



  /**
   * Função hash simples para garantir distribuição consistente
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Obtém a personalidade de uma instância
   */
  getPersonality(instanceId: string): PersonalityProfile | undefined {
    const personalityId = this.instancePersonalities.get(instanceId);
    if (!personalityId) return undefined;
    
    return this.personalities.find(p => p.id === personalityId);
  }

  /**
   * Gera uma mensagem personalizada baseada na personalidade
   */
  generatePersonalizedMessage(instanceId: string, context: 'greeting' | 'casual' | 'reaction' | 'farewell' = 'casual'): string | null {
    const personality = this.getPersonality(instanceId);
    if (!personality) return null;

    const vocabulary = personality.vocabulary;
    if (!vocabulary || vocabulary.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * vocabulary.length);
    return vocabulary[randomIndex];
  }

  /**
   * Calcula o intervalo de mensagem baseado na personalidade
   */
  calculateMessageInterval(instanceId: string): number | null {
    const personality = this.getPersonality(instanceId);
    if (!personality) {
      return null;
    }

    const { min, max, peak } = personality.messageFrequency;
    
    // Usa distribuição normal centrada no peak
    const range = max - min;
    const normalizedPeak = (peak - min) / range;
    
    // Gera número aleatório com tendência ao peak
    let random = Math.random();
    if (Math.random() < 0.7) { // 70% de chance de ficar próximo ao peak
      random = normalizedPeak + (Math.random() - 0.5) * 0.3;
      random = Math.max(0, Math.min(1, random));
    }
    
    return Math.floor(random * range) + min;
  }



  /**
   * Verifica se está no horário ativo da personalidade
   */
  isActiveTime(instanceId: string): boolean {
    const personality = this.getPersonality(instanceId);
    if (!personality) return true; // Se não tem personalidade, sempre ativo

    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = personality.activeHours;

    // Trata casos onde o horário cruza a meia-noite (ex: 20h às 6h)
    if (start <= end) {
      return currentHour >= start && currentHour <= end;
    } else {
      return currentHour >= start || currentHour <= end;
    }
  }



  /**
   * Determina se a instância deve responder baseado na personalidade
   */
  shouldRespond(instanceId: string): boolean {
    const personality = this.getPersonality(instanceId);
    if (!personality) return true;

    return Math.random() < personality.behaviorTraits.responseChance;
  }

  /**
   * Determina se a instância deve iniciar uma conversa
   */
  shouldInitiateConversation(instanceId: string): boolean {
    const personality = this.getPersonality(instanceId);
    if (!personality) return true;

    return Math.random() < personality.behaviorTraits.initiateConversationChance;
  }

  /**
   * Determina se a instância deve enviar mensagem (combinação de resposta e iniciativa)
   */
  shouldSendMessage(instanceId: string): boolean {
    const personality = this.getPersonality(instanceId);
    if (!personality) return true;

    // Combina chance de resposta e iniciativa para determinar se deve enviar
    const combinedChance = (personality.behaviorTraits.responseChance + personality.behaviorTraits.initiateConversationChance) / 2;
    return Math.random() < combinedChance;
  }

  /**
   * Seleciona o tipo de mídia baseado na personalidade
   */
  selectMediaType(instanceId: string): MessageType {
    const personality = this.getPersonality(instanceId);
    if (!personality) return MessageType.TEXT;

    const preferences = personality.mediaPreferences;
    const random = Math.random();
    let cumulative = 0;
    const totalWeight = Object.values(preferences).reduce((sum, weight) => sum + weight, 0);

    for (const [type, weight] of Object.entries(preferences)) {
      cumulative += weight / totalWeight;
      if (random <= cumulative) {
        // Mapeia string para MessageType
        switch (type.toLowerCase()) {
          case 'text': return MessageType.TEXT;
          case 'audio': return MessageType.AUDIO;
          case 'image': return MessageType.IMAGE;
          case 'video': return MessageType.VIDEO;
          case 'document': return MessageType.DOCUMENT;
          case 'sticker': return MessageType.STICKER;
          case 'location': return MessageType.LOCATION;
          default: return MessageType.TEXT;
        }
      }
    }

    return MessageType.TEXT; // fallback
  }

  /**
   * Lista todas as personalidades atribuídas
   */
  listAssignedPersonalities(): Array<{instanceId: string, personality: PersonalityProfile}> {
    const result: Array<{instanceId: string, personality: PersonalityProfile}> = [];
    
    for (const [instanceId, personalityId] of this.instancePersonalities) {
      const personality = this.personalities.find(p => p.id === personalityId);
      if (personality) {
        result.push({ instanceId, personality });
      }
    }
    
    return result;
  }

  /**
   * Obtém estatísticas das personalidades
   */
  getPersonalityStats(): Array<{id: string, name: string, count: number}> {
    const stats: {[personalityId: string]: number} = {};
    
    for (const personality of this.personalities) {
      stats[personality.id] = 0;
    }
    
    for (const [, personalityId] of this.instancePersonalities) {
      stats[personalityId]++;
    }
    
    // Converte para array com nomes das personalidades
    return this.personalities.map(personality => ({
      id: personality.id,
      name: personality.name,
      count: stats[personality.id] || 0
    }));
  }

  /**
   * Busca uma personalidade pelo ID
   */
  getPersonalityById(personalityId: string): PersonalityProfile | undefined {
    return this.personalities.find(p => p.id === personalityId);
  }
}