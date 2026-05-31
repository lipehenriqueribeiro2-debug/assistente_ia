# Blueprint de Reconstrução: Aura OS (WebGL + React)

Este documento contém a sequência estrita de prompts arquitetônicos para reconstruir a interface do Aura OS. 
**Regra para a IA:** Execute um módulo por vez. Não antecipe funcionalidades. Mantenha estritamente o design em escala de cinza (Graybox).

---

## Fase 1: O Núcleo Cinético (AiCore)
**Objetivo:** Estabelecer a geometria base, a malha instanciada com micro-sobreposição e a iluminação.

> "Atenção Engenheiro Gráfico. Inicie a construção da cena 3D principal implementando o componente `<AiCore />`. Execute estas especificações rigorosas:
> 
> **1. Geometria de Malha Fechada (Micro-Overlap):** Utilize um `InstancedMesh` para distribuir cilindros achatados (formato hexagonal) em uma formação esférica. O raio da esfera de distribuição deve ser contido (ex: 0.9). O raio individual de cada hexágono (args da `CylinderGeometry`) deve ser superdimensionado em cerca de 20% para forçar as arestas a penetrarem umas nas outras, eliminando qualquer espaço em branco na superfície.
> **2. Correção de Eixo:** Aplique `.rotateX(Math.PI / 2)` em cada instância durante o loop de posicionamento para que as faces hexagonais apontem para fora.
> **3. Onda Cinética:** No `useFrame`, aplique uma oscilação baseada em `clock.elapsedTime` para deslocar as instâncias levemente no eixo Z local. O movimento deve ser contínuo e pesado.
> **4. Estética Graybox e Iluminação:** Invoque `.computeVertexNormals()` na geometria base. O material deve ser um `MeshStandardMaterial` com `color: '#777777'`, `metalness: 0.8`, `roughness: 0.2` e, obrigatoriamente, `flatShading={true}` para estourar o contraste nas arestas da malha."

---

## Fase 2: O Carrossel e as Órbitas (OrbitalCarousel)
**Objetivo:** Criar os anéis independentes e a área de colisão segura.

> "Atenção Engenheiro Gráfico. O núcleo está funcional. Agora construa o componente irmão `<OrbitalCarousel />`. Ele não deve conter o núcleo dentro de si.
> 
> **1. Desmembramento Orbital:** Crie 4 anéis visíveis usando geometria de linha (`#BBBBBB` com transparência). Os raios exatos são: 4.2, 4.8, 5.4 e 6.0.
> **2. Agentes de Vidro e Rastros:** Distribua 4 malhas geométricas distintas (representando os agentes) nestas 4 órbitas. O material deles deve simular vidro fosco (transmissão, baixo roughness, cor quase branca). Envolva cada agente com o componente `<Trail>` do Drei (`width={0.15}`, `length={4}`, `local={false}`).
> **3. Rotação Inercial:** No `useFrame` do grupo principal, aplique uma rotação contínua no eixo Y. Escute o evento de `wheel` (scroll) do mouse para adicionar velocidade (`scrollVelocity`) que desacelera suavemente usando `MathUtils.damp`.
> **4. Hitbox Invisível:** Para resolver problemas de Raycasting, cada agente visual deve estar dentro de um `<group>` que também contém um `<mesh>` invisível esférico generoso (`visible={false}`). Os eventos de `onClick` devem ficar nesta malha invisível."

---

## Fase 3: Física de Câmera, Foco e DoF
**Objetivo:** Congelar o carrossel e aplicar o enquadramento do Quarto Quadrante.

> "Atenção Engenheiro Gráfico. O sistema orbital precisa reagir à seleção de agentes. Implemente a lógica de estado 'focusedAgent' e o enquadramento de câmera:
> 
> **1. Trava de Rotação:** Se um agente estiver selecionado (`focusedAgent !== null`), trave o incremento do `scrollVelocity` no carrossel, paralisando a cena.
> **2. Enquadramento Assimétrico (World Space):** No `useFrame`, recupere a posição global do agente clicado via `getWorldPosition(targetVec)`. Mova a câmera suavemente (`damp3`) para `[targetVec.x, targetVec.y, targetVec.z + 5.5]`.
> **3. Regra dos Terços (O Ponto Fantasma):** Imediatamente após posicionar a câmera, force-a a olhar para o lado oposto usando `camera.lookAt(targetVec.x - 2.5, targetVec.y + 1.2, targetVec.z)`. Isso forçará o agente selecionado a ficar no canto inferior direito da tela.
> **4. Profundidade de Campo (DoF):** Adicione um `<EffectComposer disableNormalPass>` com `<DepthOfField />` na raiz da cena. Se não houver foco, o blur (Bokeh) é 0. Se houver foco, anime o Bokeh para 4.0 e aponte a distância focal dinamicamente para as coordenadas do agente selecionado."

---

## Fase 4: O Bento Grid e a Injeção de Dados (Framer Motion)
**Objetivo:** Erguer o painel de HTML sobreposto com as animações de cascata.

> "Atenção Engenheiro Front-end. A física 3D está cravada. Construa o componente `<OverlayUI />` fora do Canvas para gerenciar o HTML.
> 
> **1. Estrutura Bento Grid:** Se houver um `focusedAgent`, renderize um painel à esquerda (`w-[45vw]`, `max-w-2xl`) com um CSS Grid de duas colunas. O fundo deve ser de vidro (`bg-white/10`, `backdrop-blur-md`).
> **2. Animação Staggered Reveal:** Use o Framer Motion. O painel pai precisa de uma variante com `staggerChildren`. Todos os elementos internos de texto precisam estar dentro de uma `div` com `overflow-hidden` e utilizar uma variante que os faça subir do eixo Y (de `120%` para `0%`).
> **3. Dados Estritos (Mock Data):** Popule os painéis de acordo com o ID selecionado:
> * **Agente Infra:** Título "ORQUESTRAÇÃO". Terminal: "[SYS] Monitorando fluxos locais no Prefect... Resolvendo crashes no ambiente. Sincronização Python/SQL ativa."
> * **Agente Estudos:** Título "ESTUDOS UFBA". Terminal: "[CALC] Correção de Fator de Potência ajustada para 0.2. Simulação de transmissão (Finch, 50 Hz). Análise de partida de MIT com resistor/reator concluída."
> * **Agente RPG:** Título "RPG & CAMPANHAS". Terminal: "[LORE] Renderizando atributos e blocos de estatísticas para NPCs. Gerenciando side quests em Skullport e Saint's Bay. Status do aventureiro Marcelo: Ativo."
> * **Agente Hardware:** Título "HARDWARE & SISTEMA". Terminal: "[HW] Monitorando telemetria. Status de RMA Corsair em andamento. Sincronização com Apple Watch e Poco X8 Pro Max."
> **4. Interação:** Adicione um botão 'Acessar Módulo' no grid, animado pelo Framer Motion, e certifique-se de que o painel possui `pointer-events-auto`."

---

## Fase 5: A Home Global (Desbloqueio de Interação)
**Objetivo:** Implementar a visão geral do sistema flutuante e liberar o mouse.

> "Atenção Engenheiro Front-end. O painel da Home está interceptando os cliques do motor 3D (problema de 'Invisible Wall'). Precisamos remover o contêiner bloqueador, fixar a tipografia diretamente na tela usando 'pointer-events-none' e adicionar a Logo da aplicação. Execute estas atualizações arquitetônicas no `<OverlayUI />`:
> 
> **1. A Regra de Ouro do Pointer Events:** O contêiner principal do `<OverlayUI />` (o wrapper absoluto de tamanho `w-full h-full`) DEVE ter estritamente a classe `pointer-events-none`. Aplique `pointer-events-auto` APENAS em botões clicáveis, links ou painéis de dados (como o Bento Grid dos agentes). Textos puros não devem capturar o mouse.
> **2. Injeção da Logo (Canto Superior Esquerdo):** Fora do `<AnimatePresence>`, mas dentro do `<OverlayUI />`, crie a Logo com posição fixa absoluta: `<div className="absolute top-10 left-12 z-50 pointer-events-auto select-none"><h1 className="text-2xl font-bold tracking-tighter text-gray-800">AURA<span className="text-gray-400 font-light">_OS</span></h1></div>`
> **3. Refatoração do `<HomeOverview />` (Tipografia Livre):** Remova qualquer cor de fundo (`bg-white/10`, etc.) do contêiner principal do `<HomeOverview />`. Ele não é mais um 'painel', é uma área de layout (ex: `absolute top-1/3 left-12 w-[35vw] pointer-events-none`). Adicione a classe `select-none` aos textos para evitar que o usuário selecione acidentalmente as palavras ao tentar arrastar a tela. Mantenha a animação Staggered Reveal (`panelVariants` e `textVariants`).
> **4. Limpeza Visual do Conteúdo:** > * Título Principal: Mantenha a tipografia massiva `text-6xl font-semibold text-gray-800 tracking-tight leading-none` flutuando direto sobre o fundo off-white. 
> * Descrição: Mantenha o texto cinza, mas sem caixas ao redor. 
> * O Mini Grid de Status: Pode manter o efeito de vidro (`bg-white/40 backdrop-blur-md border border-white p-4 rounded-lg`), mas garanta que ele possua `pointer-events-none`. 
> 
> O resultado deve ser a sensação de uma revista digital (editorial): o texto existe no mesmo espaço que o 3D, mas o mouse passa através das letras e interage perfeitamente com a escultura de vidro no fundo."