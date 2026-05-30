import { useState, useEffect, useCallback, useRef } from 'react';

export interface BackendState {
  logs: Record<string, string[]>;
  sendCommand: (command: string) => Promise<void>;
  connected: boolean;
}

export function useTauriBackend(): BackendState {
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [connected, setConnected] = useState(false);
  const unlistenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const { isTauri } = await import('@tauri-apps/api/core');
        if (!isTauri()) {
          setConnected(false);
          return;
        }

        const { listen } = await import('@tauri-apps/api/event');

        if (cancelled) return;
        setConnected(true);

        const unlisten = await listen<{ module: string; lines: string[] }>('log-stream', (event) => {
          const { module, lines } = event.payload;
          setLogs((prev) => ({
            ...prev,
            [module]: [...(prev[module] || []), ...lines],
          }));
        });

        if (cancelled) {
          unlisten();
          return;
        }
        unlistenRef.current = unlisten;
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
    };
  }, []);

  const sendCommand = useCallback(async (command: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('processar_comando', { mensagem: command });
    } catch (e) {
      console.error('sendCommand error:', e);
    }
  }, []);

  return { logs, sendCommand, connected };
}
