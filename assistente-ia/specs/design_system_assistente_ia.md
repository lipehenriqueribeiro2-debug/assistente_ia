# Design System: Frost & Crimson (Minimalismo Enriquecido)

## 1. Filosofia e Visão Geral
Este design system opera em um modelo de **tensão controlada e presença viva**. A interface utiliza a predominância de tons frios (gélidos) e fundos escuros estruturais para criar um ambiente de foco técnico. 

A grande assinatura do projeto é a simbiose entre a interface 2D (painéis, tabelas, modais) e um **Núcleo de IA 3D omnipresente**, que atua como o coração pulsante do assistente. Não há gradientes decorativos estáticos; a profundidade e a vida da aplicação vêm da iluminação dinâmica do modelo 3D ao fundo e do uso estratégico de *Glassmorphism* nas camadas de navegação superior.

---

## 2. Identidade Modular (Color Tokens)

A aplicação é dividida em módulos contextuais. A base estrutural (fundos e textos) permanece a mesma, mas a cor de sotaque (Accent/Primary) transiciona de forma fluida dependendo do contexto em que o usuário se encontra.

### 2.1. Superfícies Base (Imutáveis)
| Token | Hex | Papel no Layout |
| :--- | :--- | :--- |
| `{colors.canvas-light}` | `#dee7e7` | Fundo principal (Light Mode). Gélido e limpo. |
| `{colors.canvas-night}` | `#0b1120` | Fundo ultra-profundo (Dark Mode). O vácuo onde o AiCore habita. |
| `{colors.surface-night}` | `#1e293b` | Cards, terminais e painéis de controle (Dark). |
| `{colors.hairline}` | `#3e3e4d` | Linhas divisórias ultrafinas (1px). |

### 2.2. Acentos Modulares (Transicionais)
Estas cores assumem a posição de `{colors.primary}` dependendo do módulo ativo.

| Módulo | Cor Principal | Hex | Aplicação Semântica |
| :--- | :--- | :--- | :--- |
| **Core / Orquestração** | Crimson | `#a92727` | Dashboards globais, execução de scripts e alertas críticos. |
| **Estudos** | Cobalto | `#0066ff` | Foco, concentração, organização acadêmica e relatórios. |
| **Entretenimento** | Magenta | `#b829ff` | Integração com Spotify, mídia e jogos. |
| **Finanças** | Esmeralda | `#3ecf8e` | Painéis de investimento, tabelas numéricas e fluxos transacionais. |
| **Agenda** | Ciano | `#25ced1` | Calendários, lembretes e linhas do tempo. |

---

## 3. Componente Assinatura: O Núcleo de IA (AiCore 3D)

O `AiCore` é o elemento visual mais importante do projeto. Ele não é apenas um vídeo de fundo, mas uma entidade WebGL interativa renderizada via React Three Fiber, presente de forma contínua através das rotas da aplicação.

### 3.1. Estrutura e Camadas Visuais
O núcleo é composto por três camadas físicas e matemáticas que reagem ao contexto e ao usuário:

* **Camada 0: Fundo Fluido (Aurora Shader):** Um plano de fundo que preenche toda a tela, renderizado através de *shaders* customizados. Ele mistura o fundo noturno do canvas (`#0b1120`) com as cores ativas do módulo (ex: Cobalto e Magenta) em ondas senoidais lentas e cinematográficas, criando um núcleo brilhante central e uma névoa periférica.
* **Camada 1: Núcleo Hexagonal Reativo:** 180 cilindros hexagonais distribuídos esfericamente utilizando proporção áurea. Este núcleo é vivo: ele captura a intensidade de frequências graves via microfone (Web Audio API) e pulsa fisicamente, expandindo seu raio e contraindo a escala geométrica a cada batida de áudio. Os blocos emitem luz própria (*emissive*).
* **Camada 2: Casca Geodésica Externa:** Um icosaedro modificado envolto em material de vidro escuro (*Dark Glass*) com alto índice de refração espacial (IOR 1.5). Os polígonos que formam esta casca flutuam, encolhem organicamente e se deslocam utilizando funções de onda, revelando o núcleo brilhante através de suas frestas.

### 3.2. Integração e Interatividade
* **Magnetismo Parcial:** O grupo 3D central (Núcleo + Casca) captura a posição X/Y do cursor do mouse em tempo real e rotaciona sutilmente em direção a ele, criando uma sensação de paralaxe profunda.
* **Iluminação de Estúdio:** Luzes direcionais rebatem no material metálico e reflexivo da casca, enquanto uma `PointLight` dinâmica orbita o conjunto de forma perene.

---

## 4. Tipografia (Dual-Stack)

* **Interface (Inter):** Utilizada para títulos e blocos de texto. Tamanhos display recebem *letter-spacing* negativo (ex: `-0.37px`) para densidade editorial.
* **Dados e Código (IBM Plex Mono):** Obrigatória para números, matrizes de dados, logs de execução Python e relatórios técnicos.

---

## 5. Geometria e Superfícies (UI 2D)

O minimalismo sobre o `AiCore` exige superfícies limpas para não poluir a tela.

* **Raios de Borda Híbridos:** `{rounded.full}` (Pílulas) para botões de ação e barras de pesquisa. `{rounded.sm}` (6px) para terminais, modais de código e tabelas de dados.
* **Painéis Translúcidos (Glassmorphism):** Para permitir que o fundo 3D respire, a maioria dos painéis de interface principal utiliza fundos noturnos translúcidos (`rgba(30, 41, 59, 0.6)`) combinados com `backdrop-filter: blur(16px)`.
* **Ausência de Sombras:** Como a profundidade já é dada pela iluminação 3D de fundo, os cards 2D não utilizam *box-shadow*. A divisão entre elementos é feita exclusivamente por bordas em `{colors.hairline}`.

---

## 6. Comportamentos de Motion e Transições

As transições da aplicação devem refletir fluidez de dados e coerência física.

* **Transição de Módulos (Color Morphing):** Ao navegar de "Estudos" para "Finanças", o fundo 3D não sofre recarregamento (*hard reload*). As propriedades *Uniform* do shader de aurora transicionam lentamente via interpolação de cores (ex: de Cobalto para Esmeralda) ao longo de 1200ms.
* **View Transitions API (Shared Elements):** Elementos da interface 2D (como gráficos expansíveis ou tabelas numéricas) não desaparecem. Eles voam e se reencaixam fluidamente de uma rota para outra usando a física de mola (Spring).
* **Elevação em Cascata:** Ao abrir um painel de orquestração Python, os nós da interface e as linhas de log não aparecem simultaneamente. Surgem de baixo para cima com um atraso escalar de ~40ms entre cada item (*Staggered Animation*).