# Design System: AURA OS (Frost & Crimson)

## Overview

O sistema final opera numa filosofia de **tensão controlada**. Inspirado pela leveza da Apple e do Airbnb, a UI 2D é majoritariamente limpa, translúcida e com sombras mínimas. A profundidade da aplicação provém inteiramente do **AiCore 3D** rodando ao fundo, que lança luz dinâmica sobre os painéis de _glassmorphism_. O sistema é multi-tema reativo: a cor de destaque (Primary) muda fisicamente de acordo com o módulo (Agente) acessado.

## 1. Modular Color Tokens

O sistema possui a base _Frost_ (tons noturnos/gélidos para o vácuo) e a injeção do _Crimson_ (ou outras cores) baseada no estado.

**Superfícies (Imutáveis):**

- **`{colors.canvas-night}`** (`#0b1120`): O vácuo global. Usado como a camada 0 do shader do WebGL.
- **`{colors.glass-panel}`** (`rgba(255, 255, 255, 0.05)`): Background de todos os painéis Bento Grid, pareado com `backdrop-filter: blur(24px)`.
- **`{colors.hairline-glass}`** (`rgba(255, 255, 255, 0.15)`): Bordas para delinear os contêineres de vidro.

**Acentos Modulares (O Token `{colors.primary}` Dinâmico):**
Herdando a filosofia de foco único da Supabase (que usa apenas Esmeralda) e da Zapier (Laranja), o AURA_OS usa apenas uma cor de destaque por vez, mas ela varia por contexto. Toda luz no 3D e todo botão ativo respeitam este token:

- **Default / Global:** Branco Gelo (`#f8fafc`).
- **Agente Infra (Orquestração):** Crimson (`#a92727`).
- **Agente Estudos (UFBA):** Cobalto (`#0066ff`).
- **Agente RPG:** Magenta (`#b829ff`).
- **Agente Hardware:** Ciano (`#25ced1`).

## 2. Tipografia & Layout

O ritmo de leitura adota os espaçamentos da Apple (tracking negativo em displays) e a pureza do Airbnb (`rounded.md` para cards).

- **Display/Body:** `Inter`. Títulos em `Weight 600` (tracking `-0.02em`).
- **Data:** `IBM Plex Mono`.
- **Raios de Borda (Shapes):**
  - `{rounded.full}` (Pílulas): Botões do Header ("Aura AI", Microfone).
  - `{rounded.xl}` (24px): Painéis de informações do Agente (Bento Grid) e a janela do Chat.
- **Elevação (Shadows):** Nenhuma sombra projetada na interface global. Apenas um nível de sombra suave (`0 8px 32px rgba(0,0,0,0.2)`) é aplicado exclusivamente ao Painel do Elevador (Tela de Chat) quando ele sobrepõe o ambiente 3D.

## 3. O Núcleo de IA 3D (AiCore) - Especificação Física

Na versão final, a matemática da V0 ganha física e luz estrita:

1. **Camada 0 (Fundo):** _Aurora Shader_ que interpola entre o preto do canvas e a cor ativa do `{colors.primary}` do agente.
2. **Camada 1 (Núcleo Fendido):** Material preto absoluto (`roughness 0.15`, `metalness 0.9`). As fendas (Edges) recebem material emissivo vinculado ao `{colors.primary}`, reagindo com efeito _Bloom_ (Post-Processing).
3. **Camada 2 (Grade Prata):** O Icosaedro Truncado de arestas espessas se torna cromo escovado (`#a0aec0`, altamente metálico) refletindo a luz do núcleo.
4. **Camada 3 (Painéis Chanfrados):** Os grupos de 3 losangos assumem um cinza espacial profundo, capturando as luzes direcionais que orbitam o palco.
5. **Reação a Áudio (Web Audio API):** Quando o usuário ativa o microfone (`{button-mic-active}`), os vértices da camada 1 sofrem distorção (`MeshDistortMaterial`), pulsando fisicamente com a amplitude da voz.

## 4. O Sistema de Transição de Telas

A troca da visão 3D para o "Chat Mode" (aplicativo focado) abandona o conceito de corte de página.

- O Header é fixo no `z-50`.
- A visão 3D (Camada 0) sofre transição no `Framer Motion` (Textos desaparecem despedaçando-se para cima).
- O módulo de Chat materializa-se no `z-40` (`mode="wait"`). Possui uma barra lateral com histórico e um _Input Bar_ inferior.

## 5. Detalhamento Modular das Páginas dos Agentes (Bento Grids)

O painel esquerdo reage em conteúdo e cor quando um agente orbital é focado no centro-direito da tela.

### 5.1. Módulo: INFRA & AUTOMAÇÃO (Ai_Orchestrator)

- **Cor Ativa:** Crimson (`#a92727`).
- **Header do Card:** Indicador de Status verde "Sincronizado". Título "ORQUESTRAÇÃO GLOBAL".
- **Bento Block 1 (Console):** Caixa com fundo `canvas-night`. Fonte IBM Plex Mono exibindo um loop de texto de instâncias do Prefect e execução de fluxos Python.
- **Bento Block 2 (Métricas):** Grid 2x2. "Containers Docker Ativos", "Uso de CPU", "Latência de Rede". Valores em destaque.

### 5.2. Módulo: ESTUDOS UFBA (Ai_Engineer)

- **Cor Ativa:** Cobalto (`#0066ff`).
- **Header do Card:** Título "ESTUDOS UFBA // ENGENHARIA ELÉTRICA".
- **Bento Block 1 (LaTeX Preview):** Fundo translúcido. Equações formatadas (ex: Fator de Potência 0.2, Matriz de MIT).
- **Bento Block 2 (Atividades):** Lista de tarefas monospaçada: `> [CALC] Linha Transmissão Finch 50Hz (Concluído)`, `> [REL] ANEEL Padrões`.

### 5.3. Módulo: RPG & CAMPANHAS (Ai_DungeonMaster)

- **Cor Ativa:** Magenta (`#b829ff`).
- **Header do Card:** Título "LORE & RPG MANAGEMENT".
- **Bento Block 1 (World-State):** Display de atributos em formato de ficha de RPG limpa. Foco em "Skullport" e "Saint's Bay".
- **Bento Block 2 (Party Tracker):** Tabela minimalista listando os 8 jogadores. Destaque para o status "Marcelo: Turno Ativo".

### 5.4. Módulo: HARDWARE & SISTEMA (Ai_Hardware)

- **Cor Ativa:** Ciano (`#25ced1`).
- **Header do Card:** Título "TELEMETRIA DE HARDWARE".
- **Bento Block 1 (Visualização de Dados):** Micro-gráficos de linha (Sparklines) vetoriais mostrando flutuação térmica do processador e memória.
- **Bento Block 2 (Dispositivos):** Lista de conexões de ecossistema: Apple Watch (Sync: OK), Poco X8 Pro Max, e Status RMA Corsair em barra de progresso.
