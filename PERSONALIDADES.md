# Sistema de Personalidades - Trigger Maturador

## Visão Geral

O sistema de personalidades foi implementado para tornar o comportamento das instâncias do WhatsApp mais realista e variado. Cada instância recebe uma personalidade única que influencia:

- **Frequência de mensagens**: Intervalos entre envios
- **Tipos de mídia preferidos**: Texto, áudio, imagem, vídeo, etc.
- **Vocabulário**: Palavras e expressões características
- **Comportamento**: Chance de responder e iniciar conversas
- **Horários ativos**: Períodos do dia em que a instância está mais ativa

## Personalidades Disponíveis

### 1. Comunicativo (casual_frequent)
- **Descrição**: Pessoa que gosta de conversar e envia mensagens frequentemente
- **Frequência**: 30s - 2min (pico: 1min)
- **Mídia favorita**: Texto (40%), Imagem (20%), Áudio (15%)
- **Horário ativo**: 7h às 23h
- **Comportamento**: Muito responsivo (80%) e proativo (60%)

### 2. Profissional (professional)
- **Descrição**: Pessoa mais formal e objetiva nas comunicações
- **Frequência**: 5min - 30min (pico: 15min)
- **Mídia favorita**: Texto (60%), Documento (20%), Imagem (10%)
- **Horário ativo**: 8h às 18h
- **Comportamento**: Muito responsivo (90%) mas pouco proativo (30%)

### 3. Noturno (night_owl)
- **Descrição**: Pessoa mais ativa durante a noite
- **Frequência**: 2min - 10min (pico: 5min)
- **Mídia favorita**: Texto (30%), Imagem (25%), Áudio (20%)
- **Horário ativo**: 20h às 6h (madrugada)
- **Comportamento**: Responsivo (70%) e moderadamente proativo (50%)

### 4. Minimalista (minimalist)
- **Descrição**: Pessoa que prefere mensagens curtas e diretas
- **Frequência**: 10min - 1h (pico: 30min)
- **Mídia favorita**: Texto (80%), Imagem (10%), Documento (5%)
- **Horário ativo**: 9h às 22h
- **Comportamento**: Moderadamente responsivo (60%) e pouco proativo (20%)

### 5. Social (social_butterfly)
- **Descrição**: Pessoa muito sociável que adora compartilhar conteúdo
- **Frequência**: 1min - 5min (pico: 3min)
- **Mídia favorita**: Imagem (30%), Texto (20%), Áudio/Vídeo (20% cada)
- **Horário ativo**: 6h às 24h (quase o dia todo)
- **Comportamento**: Muito responsivo (90%) e muito proativo (80%)

## Como Funciona

### Atribuição de Personalidades
- As personalidades são atribuídas automaticamente quando uma instância é detectada
- A seleção é baseada em pesos configurados:
  - Comunicativo: 30%
  - Profissional: 20%
  - Noturno: 20%
  - Minimalista: 15%
  - Social: 15%

### Cálculo de Intervalos
- Cada personalidade tem um intervalo mínimo, máximo e um pico
- 70% das vezes o intervalo fica próximo ao pico
- 30% das vezes é distribuído aleatoriamente entre min e max

### Verificações de Comportamento
Antes de enviar uma mensagem, o sistema verifica:
1. **Horário ativo**: Se a instância está no seu período ativo
2. **Chance de envio**: Baseada na combinação de responsividade e proatividade
3. **Tipo de mídia**: Selecionado baseado nas preferências da personalidade

### Mensagens Personalizadas
- Cada personalidade tem seu próprio vocabulário
- As mensagens são selecionadas aleatoriamente do vocabulário da personalidade
- Fallback para mensagens padrão se não houver personalidade

## Arquivos do Sistema

### `personalities.ts`
Classe principal `PersonalityManager` que gerencia:
- Atribuição de personalidades às instâncias
- Cálculo de intervalos personalizados
- Seleção de tipos de mídia
- Geração de mensagens personalizadas
- Verificação de horários ativos

### `personality-config.ts`
Configurações das personalidades:
- Definições completas de cada personalidade
- Pesos para seleção aleatória
- Fácil modificação e adição de novas personalidades

### `types.ts`
Interfaces e enums:
- `PersonalityProfile`: Estrutura de uma personalidade
- `MessageType`: Tipos de mídia disponíveis
- Outras interfaces do sistema

## Estatísticas

O sistema exibe estatísticas em tempo real mostrando:
- Quantas instâncias estão usando cada personalidade
- Distribuição das personalidades ativas

## Benefícios

1. **Comportamento Realista**: Cada instância age de forma única
2. **Variação Temporal**: Diferentes horários de atividade
3. **Diversidade de Conteúdo**: Preferências variadas de mídia
4. **Escalabilidade**: Fácil adição de novas personalidades
5. **Configurabilidade**: Pesos e comportamentos ajustáveis

## Futuras Melhorias

- Personalidades que evoluem com o tempo
- Aprendizado baseado em interações
- Personalidades sazonais ou baseadas em eventos
- Grupos de personalidades compatíveis
- Análise de efetividade das personalidades