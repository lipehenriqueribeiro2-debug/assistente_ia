import { useRef, useCallback, useEffect } from 'react';

export function useMicrophone() {
  const audioVolumeRef = useRef(0);
  const isListeningRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      isListeningRef.current = true;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!isListeningRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        audioVolumeRef.current = average / 255;
        rafRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch {
      audioVolumeRef.current = 0;
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    audioVolumeRef.current = 0;
  }, []);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return { audioVolumeRef, isListeningRef, startListening, stopListening };
}
