# Blueprint V0: AURA OS (Graybox & Vetorizado)

## Overview

A V0 do AURA_OS opera como um "esqueleto" de engenharia. O objetivo é validar o layout (Bento Grids), a navegação por estados (Elevador de Viewport) e a topologia matemática do motor 3D. Não há cores, texturas reflexivas ou iluminação complexa. O canvas é branco, as linhas são cinzas e o núcleo é um _wireframe_ estrutural. A estética é de um diagrama técnico (blueprint) ganhando vida.

## 1. Color Tokens (V0 Palette)

Inspirado na hierarquia de cinzas do Supabase, o sistema V0 utiliza uma paleta estritamente monocromática.

- **`{colors.canvas}`** (`#f9fafb`): O fundo global da página. Quase branco, anti-fadiga.
- **`{colors.ink}`** (`#171717`): O texto principal (Títulos e Botões Ativos). Near-black.
- **`{colors.ink-muted}`** (`#8b8d98`): Textos secundários, status, labels do Bento Grid.
- **`{colors.hairline}`** (`#e5e7eb`): Bordas de componentes, órbitas do carrossel 3D e divisórias de grid.
- **`{colors.wireframe-3d}`** (`#a0aec0`): Cor padrão das linhas renderizadas no WebGL (EdgesGeometry).

## 2. Tipografia (Dual-Stack)

Semelhante à filosofia da Binance (BinanceNova + BinancePlex), o AURA_OS separa rigidamente a interface dos dados.

- **Interface (UI):** `Inter, -apple-system, sans-serif`. Usado para títulos globais e botões.
- **Dados (Data/Logs):** `IBM Plex Mono, monospace`. Usado para os terminais dos agentes, tags, blocos de código e status numéricos.

| Token                       | Size | Weight | Letter Spacing | Uso                                                    |
| --------------------------- | ---- | ------ | -------------- | ------------------------------------------------------ |
| `{typography.hero-display}` | 56px | 600    | -0.02em        | Títulos da visão global ("Sistemas Sincronizados").    |
| `{typography.module-title}` | 40px | 600    | -0.015em       | Nome do Agente focado (ex: "ESTUDOS UFBA").            |
| `{typography.body-mono}`    | 13px | 400    | 0              | Logs de terminal dentro do Bento Grid (IBM Plex Mono). |
| `{typography.button}`       | 14px | 500    | 0              | CTAs (`Acessar Módulo`).                               |

## 3. Geometria 3D (O Núcleo V0)

A renderização deve usar `meshBasicMaterial` ou materiais de linha, garantindo o visual vetorizado (flat).

- **Casca Externa (`ShellWireframe`):** Um Icosaedro Truncado renderizado apenas através de suas arestas (`EdgesGeometry`). Arestas finas (1px) no tom `{colors.wireframe-3d}`. Construção animada via `setDrawRange` (Efeito Laser).
- **Painéis da Casca (`ShellPanels`):** Polígonos de 4 pontas (losangos) chanfrados agrupados em 3 (formando um hexágono com vão em "Y"). Material cinza sólido e _flat_ (`#e2e8f0`).
- **Núcleo Central (`InnerHexCore`):** Uma esfera geodésica sólida negra (`#111111`) baseada na mesma subdivisão, com fendas brancas puras mapeadas nas arestas para simular vazão de dados/luz sem usar _Bloom_.

## 4. O Sistema de Transição (FLIP/Morphing)

Herdando o comportamento _premium_ de portfólios (Awwwards) e usando `Framer Motion`:

- A transição entre Visão Global, Foco no Agente e a subida da Tela de Chat não ocorre por cortes secos.
- Os blocos de texto sofrem desfragmentação (_Staggered Exit_): palavras/linhas flutuam no eixo Y independentemente e reaparecem via `mode="wait"`.

## 5. Estrutura dos Agentes (Bento Grid V0)

Quando um agente é focado, o painel esquerdo apresenta um card encapsulado (`bg-white/40`, borda `{colors.hairline}`, sem sombra). Os dados são mockups em escala de cinza:

1. **[Agente 1] Orquestração & Infra:** Título em Inter. Grid de status em IBM Plex Mono mostrando `[Nodes Ativos]`, `[Uptime]`. Mini-terminal mostrando log de sync do Prefect.
2. **[Agente 2] Estudos UFBA:** Terminal exibindo blocos de `[LaTeX]` renderizados em texto puro. Lista de métricas: `Freq: 50Hz`, `Condutor: Finch`.
3. **[Agente 3] RPG & Campanhas:** Estrutura de tabela monospaçada exibindo Status de NPCs (ex: Marcelo), HP e locais (Skullport).
4. **[Agente 4] Hardware & OS:** Gráficos de barra em ASCII/SVG simples (`#e5e7eb` fill). Leituras de telemetria do PC, RMA da Corsair e status do Apple Watch.
