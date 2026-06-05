import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconOrq, IconEst, IconRpg, IconHw, IconPow,
  IconMic, IconSend, IconChevron,
} from './AnimatedIcons';

type ModelKey = 'orq' | 'est' | 'rpg' | 'hw' | 'pow';

// Componentes de ícone mapeados por agente (renderizados com isFocused no JSX)
const AGENT_ICON_COMPONENTS: Record<ModelKey, React.ComponentType<{ isFocused?: boolean; size?: number; color?: string }>> = {
  orq: IconOrq,
  est: IconEst,
  rpg: IconRpg,
  hw:  IconHw,
  pow: IconPow,
};

const MODELS_INFO: Record<ModelKey, Omit<ModelInfo, 'icon'>> = {
  orq: {
    name: 'Aura-Turbo',
    color: '#a92727',
    desc: 'Assistente geral e orquestração',
    suggestions: [
      'Verificar integridade dos containers Docker',
      'Configurar pipeline de deploy automático no Prefect',
      'Gerar script Bash de backup do PostgreSQL'
    ],
    autoReply: 'Status dos containers de infraestrutura verificado com sucesso. Nginx, Redis e Postgres estão operacionais. Os logs do host mostram integridade estável. Deseja realizar outra tarefa de orquestração?'
  },
  est: {
    name: 'Aura-Academic',
    color: '#0066ff',
    desc: 'Análise de disciplinas, notas e LaTeX',
    suggestions: [
      'Estruturar template LaTeX de relatório técnico',
      'Simular notas necessárias para aprovação na UFBA',
      'Explicar o teorema de redes de Kirchhoff para Circuitos'
    ],
    autoReply: 'Template LaTeX estruturado. Lembre-se de importar o pacote abntex2 para conformidade com a ABNT. Adicionei os cabeçalhos para o Departamento de Engenharia Elétrica da UFBA. Posso redigir a seção de metodologia?'
  },
  rpg: {
    name: 'Aura-RPG',
    color: '#b829ff',
    desc: 'Fichas, iniciativa e narrativa de campanhas',
    suggestions: [
      'Sortear iniciativa de combate (Rolagem D20)',
      'Consultar atributos de monstro no bestiário',
      'Criar NPC ladino elfo em porto comercial'
    ],
    autoReply: 'D20 rolado! Resultado: 14 + 3 (Modificador de Destreza) = 17. O ataque do Guerreiro atinge com sucesso a classe de armadura do monstro. Deseja rolar o dano do ataque ou sortear a reação do inimigo?'
  },
  hw: {
    name: 'Aura-Hardware',
    color: '#25ced1',
    desc: 'Termometria, SMART e ventoinhas',
    suggestions: [
      'Exibir termometria dos núcleos da CPU',
      'Verificar integridade SMART do NVMe',
      'Medir velocidade (RPM) das ventoinhas'
    ],
    autoReply: 'Métricas térmicas recuperadas. Núcleos CPU a 42°C (estável). A saúde SMART do NVMe principal está em 98.4% de vida útil restante. Fans operando a 1250 RPM. Deseja realizar um teste de estresse rápido?'
  },
  pow: {
    name: 'Aura-Power',
    color: '#ffaa00',
    desc: 'Análise harmônica, fases e subestações',
    suggestions: [
      'Calcular DHT (Distorção Harmônica Total)',
      'Simular chaveamento de disjuntor da rede',
      'Analisar equilíbrio de fase da subestação'
    ],
    autoReply: 'Distorção Harmônica Total calculada: DHT-V = 3.25% (fase A), 3.12% (fase B), 3.38% (fase C). Valores estão em conformidade com o PRODIST Módulo 8 (limite de 5%). Deseja gerar o gráfico da senóide harmônica?'
  }
};

interface ModelInfo {
  name: string;
  color: string;
  desc: string;
  suggestions: string[];
  autoReply: string;
}

interface Message {
  sender: 'user' | 'aura';
  text: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  model: ModelKey;
  messages: Message[];
}

interface ChatInterfaceProps {
  focusedAgent: string | null;
  onSelectAgent: (id: string | null) => void;
  theme?: 'dark' | 'light';
}

export function ChatInterface({ focusedAgent, onSelectAgent, theme = 'dark' }: ChatInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState<ModelKey>('orq');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([
    { id: '1', title: 'Orquestração Central', model: 'orq', messages: [] }
  ]);
  const [activeChatId, setActiveChatId] = useState<string>('1');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  // Animação de scanline
  useEffect(() => {
    const id = setInterval(() => setScanLine(p => (p + 1) % 100), 80);
    return () => clearInterval(id);
  }, []);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  // Estado de animação do botão de enviar (shake ao disparar)
  const [sendTriggered, setSendTriggered] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const activeModelInfo = MODELS_INFO[selectedModel];

  // Sincroniza focusedAgent vindo de fora com o modelo selecionado no chat
  useEffect(() => {
    if (focusedAgent) {
      const keys: ModelKey[] = ['orq', 'est', 'rpg', 'hw', 'pow'];
      if (keys.includes(focusedAgent as ModelKey) && focusedAgent !== selectedModel) {
        setSelectedModel(focusedAgent as ModelKey);
      }
    }
  }, [focusedAgent]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages, isTyping]);

  // Inicializar Reconhecimento de Voz
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'pt-BR';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          setTimeout(() => {
            handleSend(transcript);
          }, 600);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [selectedModel, activeChatId]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      // Fallback simulado se não houver suporte de voz no navegador
      setIsRecording(true);
      const mockPrompts: Record<ModelKey, string[]> = {
        orq: ["status dos containers docker", "gerar script postgres backup"],
        est: ["gerar template latex", "teorema de kirchhoff circuitos"],
        rpg: ["rolar d20 iniciativa", "atributos do dragao vermelho"],
        hw: ["temperatura da cpu agora", "rpm das ventoinhas"],
        pow: ["calcular dht harmônica", "equilíbrio de fase subestação"]
      };
      const list = mockPrompts[selectedModel];
      const randomPrompt = list[Math.floor(Math.random() * list.length)];
      
      setTimeout(() => {
        setInputValue(randomPrompt);
        setIsRecording(false);
        setTimeout(() => {
          handleSend(randomPrompt);
        }, 800);
      }, 2000);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = (textToSend = inputValue) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    // Atualiza mensagens no chat ativo
    const updatedChats = chats.map(c => {
      if (c.id === activeChatId) {
        const newTitle = c.messages.length === 0 ? (textToSend.slice(0, 22) + (textToSend.length > 22 ? '...' : '')) : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, userMsg]
        };
      }
      return c;
    });

    setChats(updatedChats);
    setInputValue('');
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.value = '';
    }

    // Simula resposta da IA correspondente
    setTimeout(() => {
      const auraMsg: Message = {
        sender: 'aura',
        text: MODELS_INFO[selectedModel].autoReply,
        timestamp: new Date()
      };

      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, auraMsg] };
        }
        return c;
      }));
      setIsTyping(false);
    }, 1200);
  };

  const handleAnimatedSend = () => {
    setSendTriggered(true);
    handleSend();
    setTimeout(() => setSendTriggered(false), 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const createNewChat = () => {
    const newId = String(Date.now());
    const newChat: ChatSession = {
      id: newId,
      title: `Nova conversa #${chats.length + 1}`,
      model: selectedModel,
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
  };

  const selectModel = (key: ModelKey) => {
    setSelectedModel(key);
    onSelectAgent(key); // Sincroniza bidirecionalmente com o estado global da Home/Fundo 3D
    setDropdownOpen(false);
    
    // Atualiza o modelo do chat atual se ele não tiver mensagens
    if (activeChat.messages.length === 0) {
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return { ...c, model: key };
        }
        return c;
      }));
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      color: 'var(--text-primary)',
      overflow: 'hidden',
      height: '76vh',
      position: 'relative',
      background: `
        repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
        repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
        radial-gradient(circle at 50% 50%, transparent 0%, var(--chat-bg) 100%)
      `,
    }}>
      {/* ── Scanline decorativa ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: `${scanLine}%`,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${activeModelInfo.color}${theme === 'light' ? '06' : '15'}, transparent)`,
          pointerEvents: 'none',
          transition: 'top 0.08s linear',
          zIndex: 10,
        }}
      />

      {/* ── Marcadores HUD de Canto (HUD corners) ── */}
      {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
        <div
          key={c}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 12,
            height: 12,
            pointerEvents: 'none',
            zIndex: 11,
            borderColor: `${activeModelInfo.color}${theme === 'light' ? '80' : '99'}`,
            borderStyle: 'solid',
            transition: 'border-color 0.25s ease',
            ...(c === 'tl' && { top: 6, left: 6, borderWidth: '1.5px 0 0 1.5px', borderRadius: '2px 0 0 0' }),
            ...(c === 'tr' && { top: 6, right: 6, borderWidth: '1.5px 1.5px 0 0', borderRadius: '0 2px 0 0' }),
            ...(c === 'bl' && { bottom: 6, left: 6, borderWidth: '0 0 1.5px 1.5px', borderRadius: '0 0 0 2px' }),
            ...(c === 'br' && { bottom: 6, right: 6, borderWidth: '0 1.5px 1.5px 0', borderRadius: '0 0 2px 0' }),
          }}
        />
      ))}
      {/* Barra Lateral Histórico */}
      <aside style={{ 
        width: '16rem', 
        borderRight: '1px solid var(--border-header)', 
        background: `
          repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 6px),
          repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 6px),
          var(--item-bg)
        `,
        display: 'flex', 
        flexDirection: 'column', 
        flexShrink: 0,
        position: 'relative'
      }}>
        {/* Cantoneiras internas da barra lateral */}
        {(['tl', 'br'] as const).map(c => (
          <div
            key={c}
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              pointerEvents: 'none',
              zIndex: 3,
              borderColor: 'var(--border-card)',
              borderStyle: 'solid',
              ...(c === 'tl' && { top: 4, left: 4, borderWidth: '1px 0 0 1px' }),
              ...(c === 'br' && { bottom: 4, right: 4, borderWidth: '0 1px 1px 0' }),
            }}
          />
        ))}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-header)' }}>
          <button
            onClick={createNewChat}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--item-bg)',
              color: 'var(--text-white)',
              border: '1px solid var(--border-card)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '-0.2px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--border-card)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--item-bg)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Chat
          </button>
        </div>
        
        {/* Lista de Chats Históricos */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {chats.map(session => {
            const isSelected = session.id === activeChatId;
            const modelColor = MODELS_INFO[session.model].color;
            return (
              <button
                key={session.id}
                onClick={() => {
                  setActiveChatId(session.id);
                  selectModel(session.model);
                }}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.375rem',
                  background: isSelected ? 'var(--item-bg)' : 'transparent',
                  border: 'none',
                  color: isSelected ? 'var(--text-white)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--item-bg)'; }}
                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: modelColor }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {session.title}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Área Principal de Conversa */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: 'transparent' }}>
        {/* Cabeçalho do Chat */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0.85rem 1.25rem', 
          borderBottom: '1px solid var(--border-header)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }} ref={dropdownRef}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Agente Vigente:</span>
            
            {/* Seletor Dropdown */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                padding: '6px 12px', 
                borderRadius: '0.5rem', 
                background: 'var(--item-bg)',
                border: '1px solid var(--border-card)', 
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', 
                fontSize: 13, 
                fontWeight: 500,
                color: 'var(--text-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                transition: 'all 200ms ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--border-card)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--item-bg)'; }}
            >
              {/* Ícone do agente ativo com animação de foco */}
              {(() => { const AgentIcon = AGENT_ICON_COMPONENTS[selectedModel]; return <span style={{ color: activeModelInfo.color }}><AgentIcon isFocused size={14} /></span>; })()}
              <span>{activeModelInfo.name}</span>
              <IconChevron isOpen={dropdownOpen} size={12} color="currentColor" />
            </button>

            {/* Menu Dropdown com Glassmorphism */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 95,
                    width: '18rem',
                    background: `
                      repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                      repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                      var(--bg-card-solid)
                    `,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${activeModelInfo.color}33`,
                    borderRadius: '0.75rem',
                    boxShadow: `0 10px 25px rgba(0,0,0,0.15), 0 0 15px ${activeModelInfo.color}${theme === 'light' ? '08' : '15'}`,
                    padding: '0.5rem',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  {/* Cantoneiras HUD no Dropdown de Agentes */}
                  {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
                    <div
                      key={c}
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        pointerEvents: 'none',
                        zIndex: 101,
                        borderColor: `${activeModelInfo.color}${theme === 'light' ? '80' : '99'}`,
                        borderStyle: 'solid',
                        ...(c === 'tl' && { top: 4, left: 4, borderWidth: '1.2px 0 0 1.2px', borderRadius: '1.5px 0 0 0' }),
                        ...(c === 'tr' && { top: 4, right: 4, borderWidth: '1.2px 1.2px 0 0', borderRadius: '0 1.5px 0 0' }),
                        ...(c === 'bl' && { bottom: 4, left: 4, borderWidth: '0 0 1.2px 1.2px', borderRadius: '0 0 0 1.5px' }),
                        ...(c === 'br' && { bottom: 4, right: 4, borderWidth: '0 1.2px 1.2px 0', borderRadius: '0 0 1.5px 0' }),
                      }}
                    />
                  ))}
                  {(Object.keys(MODELS_INFO) as ModelKey[]).map(key => {
                    const info = MODELS_INFO[key];
                    const isSelected = key === selectedModel;
                    return (
                      <button
                        key={key}
                        onClick={() => selectModel(key)}
                        style={{
                          width: '100%',
                          padding: '0.625rem 0.75rem',
                          borderRadius: '0.5rem',
                          background: isSelected ? 'var(--item-bg)' : 'transparent',
                          border: 'none',
                          color: 'var(--text-white)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          transition: 'all 200ms ease',
                        }}
                        onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--item-bg)'; }}
                        onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
                          {/* Ícone animado por agente */}
                          {(() => { const AgentIcon = AGENT_ICON_COMPONENTS[key]; return <span style={{ color: info.color }}><AgentIcon isFocused={isSelected} size={14} /></span>; })()}
                          <span>{info.name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 20 }}>
                          {info.desc}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeModelInfo.color, animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: activeModelInfo.color, letterSpacing: '0.5px', fontWeight: 600 }}>ONLINE</span>
          </div>
        </div>

        {/* Corpo do chat */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeChat.messages.length === 0 ? (
            // Layout Inicial Bento para Interface Vazia
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '44rem', margin: '0 auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: `${activeModelInfo.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', border: `1px solid ${activeModelInfo.color}40`,
                  color: activeModelInfo.color
                }}>
                  {(() => { const AgentIcon = AGENT_ICON_COMPONENTS[selectedModel]; return <AgentIcon isFocused size={22} color={activeModelInfo.color} />; })()}
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 6 }}>
                  Interface {activeModelInfo.name} Iniciada
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: '18px', margin: '0 auto' }}>
                  {activeModelInfo.desc}. Selecione um atalho rápido abaixo ou envie sua pergunta no input.
                </p>
              </div>

              {/* Grid Bento de Sugestões de Prompts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', width: '100%', maxWidth: '38rem' }}>
                {activeModelInfo.suggestions.map((sug, i) => {
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(2px)';
                        e.currentTarget.style.borderBottom = `1px solid ${activeModelInfo.color}40`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.borderBottom = `4.5px solid ${activeModelInfo.color}80`;
                        e.currentTarget.style.boxShadow = `0 8px 16px -2px ${activeModelInfo.color}15`;
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--border-card)';
                        e.currentTarget.style.borderColor = `${activeModelInfo.color}60`;
                        e.currentTarget.style.borderBottom = `4.5px solid ${activeModelInfo.color}80`;
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = `0 8px 16px -2px ${activeModelInfo.color}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--item-bg)';
                        e.currentTarget.style.borderColor = 'var(--border-card)';
                        e.currentTarget.style.borderBottom = `3.5px solid ${theme === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)'}`;
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                      }}
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderRadius: '0.75rem',
                        background: 'var(--item-bg)',
                        border: '1px solid var(--border-card)',
                        borderBottom: `3.5px solid ${theme === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)'}`,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        transition: 'transform 0.1s ease, border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        transform: 'translateY(0px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <span>{sug}</span>
                      <span style={{ color: activeModelInfo.color, transition: 'transform 0.2s ease' }} className="arrow-icon">➔</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Lista de Mensagens do Chat Ativo
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '44rem', margin: '0 auto', width: '100%' }}>
              {activeChat.messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '0.75rem 1rem',
                      borderRadius: isUser ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                      background: isUser ? `${activeModelInfo.color}18` : 'var(--item-bg)',
                      border: `1px solid ${isUser ? `${activeModelInfo.color}30` : 'var(--border-card)'}`,
                      color: 'var(--text-white)',
                      fontSize: 14,
                      lineHeight: '20px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {/* Loader de Digitabilidade */}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <div style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '1rem 1rem 1rem 0.25rem',
                    background: 'var(--item-bg)',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                    height: '2.25rem'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeModelInfo.color, animation: 'pulse 1.2s infinite' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeModelInfo.color, animation: 'pulse 1.2s infinite 0.2s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeModelInfo.color, animation: 'pulse 1.2s infinite 0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input da mensagem */}
        <div style={{ maxWidth: '44rem', width: '100%', margin: '0 auto', padding: '1rem', paddingBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', 
            alignItems: 'flex-end', 
            background: 'var(--item-bg)',
            border: '1px solid var(--border-card)', 
            borderRadius: '0.75rem',
            padding: '0.5rem', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', resize: 'none', padding: '0.5rem 0.75rem',
                fontFamily: 'Inter, sans-serif', fontSize: 14,
                color: 'var(--text-primary)', lineHeight: '20px',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
              {/* Botão de Gravação de Áudio — usa IconMic animado */}
              <motion.button
                onClick={toggleRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                animate={{
                  boxShadow: isRecording
                    ? ['0 0 10px rgba(239,68,68,0.3)', '0 0 18px rgba(239,68,68,0.5)', '0 0 10px rgba(239,68,68,0.3)']
                    : '0 0 0 rgba(0,0,0,0)',
                }}
                transition={isRecording ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '0.5rem',
                  border: `1px solid ${isRecording ? 'rgba(239,68,68,0.4)' : 'var(--border-card)'}`,
                  background: isRecording ? 'rgba(239,68,68,0.15)' : 'var(--item-bg)',
                  cursor: 'pointer',
                  color: isRecording ? '#ef4444' : 'var(--text-secondary)',
                  transition: 'border-color 0.2s, background 0.2s, color 0.2s',
                }}
                title={isRecording ? 'Ouvindo... Fale agora.' : 'Digitar por Voz'}
              >
                <IconMic isActive={isRecording} size={14} />
              </motion.button>

              {/* Botão de Enviar — shake animado ao disparar */}
              <motion.button
                onClick={handleAnimatedSend}
                whileHover={{ scale: 1.05, filter: 'brightness(1.12)' }}
                whileTap={{ scale: 0.93 }}
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '0.5rem',
                  background: activeModelInfo.color,
                  border: 'none', cursor: 'pointer',
                  color: 'var(--bg-app)',
                  transition: 'filter 0.2s',
                }}
              >
                <IconSend triggered={sendTriggered} size={14} />
              </motion.button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
