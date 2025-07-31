import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

/**
 * Classe responsável por registrar logs de mensagens enviadas
 */
export class MessageLogger {
  private logDir: string;
  private logFile: string;
  private enabled: boolean;

  constructor(logDir: string = './logs') {
    this.logDir = logDir;
    this.enabled = true;
    
    // Cria o diretório de logs se não existir
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Define o nome do arquivo de log com a data atual
    const today = format(new Date(), 'yyyy-MM-dd');
    this.logFile = path.join(this.logDir, `messages-${today}.log`);
  }

  /**
   * Habilita ou desabilita o logger
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Registra uma mensagem de texto enviada
   */
  logTextMessage(fromPhone: string, toPhone: string, message: string, success: boolean): void {
    if (!this.enabled) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const status = success ? 'SUCESSO' : 'FALHA';
    const logEntry = `[${timestamp}] [TEXTO] [${status}] De: ${fromPhone} Para: ${toPhone} | Mensagem: ${message}`;
    
    this.appendToLog(logEntry);
  }

  /**
   * Registra uma mensagem de mídia enviada
   */
  logMediaMessage(fromPhone: string, toPhone: string, mediaType: string, success: boolean, details: string = ''): void {
    if (!this.enabled) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const status = success ? 'SUCESSO' : 'FALHA';
    const logEntry = `[${timestamp}] [${mediaType.toUpperCase()}] [${status}] De: ${fromPhone} Para: ${toPhone}${details ? ' | ' + details : ''}`;
    
    this.appendToLog(logEntry);
  }

  /**
   * Registra uma sequência de mensagens
   */
  logMessageSequence(fromPhone: string, toPhone: string, sequenceType: string): void {
    if (!this.enabled) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logEntry = `[${timestamp}] [SEQUÊNCIA] Iniciando sequência ${sequenceType} de ${fromPhone} para ${toPhone}`;
    
    this.appendToLog(logEntry);
  }

  /**
   * Registra o início de um ciclo de envio
   */
  logCycleStart(instanceCount: number): void {
    if (!this.enabled) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logEntry = `[${timestamp}] [CICLO] Iniciando ciclo com ${instanceCount} instâncias conectadas`;
    
    this.appendToLog(logEntry);
  }

  /**
   * Registra o fim de um ciclo de envio
   */
  logCycleEnd(messagesSent: number): void {
    if (!this.enabled) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logEntry = `[${timestamp}] [CICLO] Ciclo concluído com ${messagesSent} mensagens enviadas`;
    
    this.appendToLog(logEntry);
  }

  /**
   * Registra um erro
   */
  logError(context: string, error: any): void {
    if (!this.enabled) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const errorMessage = error?.message || String(error);
    const logEntry = `[${timestamp}] [ERRO] [${context}] ${errorMessage}`;
    
    this.appendToLog(logEntry);
  }

  /**
   * Adiciona uma entrada ao arquivo de log
   */
  private appendToLog(logEntry: string): void {
    try {
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  /**
   * Obtém o caminho do arquivo de log atual
   */
  getLogFilePath(): string {
    return this.logFile;
  }

  /**
   * Obtém o conteúdo do arquivo de log atual
   */
  getLogContent(): string {
    try {
      if (fs.existsSync(this.logFile)) {
        return fs.readFileSync(this.logFile, 'utf8');
      }
      return 'Arquivo de log não encontrado.';
    } catch (error) {
      console.error('Erro ao ler arquivo de log:', error);
      return 'Erro ao ler arquivo de log.';
    }
  }

  /**
   * Lista todos os arquivos de log disponíveis
   */
  listLogFiles(): string[] {
    try {
      if (fs.existsSync(this.logDir)) {
        return fs.readdirSync(this.logDir)
          .filter(file => file.startsWith('messages-') && file.endsWith('.log'));
      }
      return [];
    } catch (error) {
      console.error('Erro ao listar arquivos de log:', error);
      return [];
    }
  }
}

// Exporta uma instância padrão do logger
export const messageLogger = new MessageLogger();