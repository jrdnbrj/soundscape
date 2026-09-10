"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import type { Product } from "../../lib/catalogue";

export type AudioMetrics = {
  amplitude: number;
  bass: number;
  mid: number;
  treble: number;
};

type AudioContextValue = {
  currentTrack: Product | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isSoundEnabled: boolean;
  loading: boolean;
  metricsRef: MutableRefObject<AudioMetrics>;
  playTrack: (track: Product) => Promise<void>;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
  togglePlay: () => Promise<void>;
  toggleSound: () => void;
  volume: number;
};

const AudioContext = createContext<AudioContextValue | null>(null);

function averageBand(values: Uint8Array, start: number, end: number) {
  let total = 0;
  let count = 0;

  for (let index = start; index < Math.min(end, values.length); index += 1) {
    total += values[index];
    count += 1;
  }

  return count === 0 ? 0 : total / count / 255;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<globalThis.AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const metricsRef = useRef<AudioMetrics>({ amplitude: 0, bass: 0, mid: 0, treble: 0 });
  const [currentTrack, setCurrentTrack] = useState<Product | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.78);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    const storedSound = window.localStorage.getItem("soundscape-sound");
    if (storedSound !== null) {
      const frame = window.requestAnimationFrame(() => setIsSoundEnabled(storedSound === "on"));
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isSoundEnabled ? volume : 0;
  }, [isSoundEnabled, volume]);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !frequencyDataRef.current) {
      metricsRef.current = { amplitude: 0, bass: 0, mid: 0, treble: 0 };
      return;
    }

    let frame = 0;
    const analyse = () => {
      const analyser = analyserRef.current;
      const frequencyData = frequencyDataRef.current;
      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        const bass = averageBand(frequencyData, 0, Math.floor(frequencyData.length * 0.16));
        const mid = averageBand(frequencyData, Math.floor(frequencyData.length * 0.16), Math.floor(frequencyData.length * 0.58));
        const treble = averageBand(frequencyData, Math.floor(frequencyData.length * 0.58), frequencyData.length);
        metricsRef.current = { amplitude: (bass + mid + treble) / 3, bass, mid, treble };
      }
      frame = window.requestAnimationFrame(analyse);
    };

    frame = window.requestAnimationFrame(analyse);
    return () => window.cancelAnimationFrame(frame);
  }, [isPlaying]);

  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return null;

    if (!contextRef.current) {
      const audioContext = new window.AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      contextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    return contextRef.current;
  }, []);

  const playTrack = useCallback(async (track: Product) => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoading(true);
    const audioContext = ensureAudioGraph();
    if (currentTrack?.id !== track.id) {
      audio.src = track.preview;
      audio.load();
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(0);
    }

    try {
      if (audioContext?.state === "suspended") await audioContext.resume();
      await audio.play();
      setIsPlaying(true);
    } finally {
      setLoading(false);
    }
  }, [currentTrack, ensureAudioGraph]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.paused) {
      const audioContext = ensureAudioGraph();
      if (audioContext?.state === "suspended") await audioContext.resume();
      await audio.play();
    } else {
      audio.pause();
    }
  }, [currentTrack, ensureAudioGraph]);

  const seek = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (value: number) => {
    setVolumeState(value);
    setIsSoundEnabled(value > 0);
  };

  const toggleSound = () => {
    setIsSoundEnabled((current) => {
      const next = !current;
      window.localStorage.setItem("soundscape-sound", next ? "on" : "off");
      return next;
    });
  };

  const value = useMemo<AudioContextValue>(() => ({
    currentTrack,
    currentTime,
    duration,
    isPlaying,
    isSoundEnabled,
    loading,
    metricsRef,
    playTrack,
    seek,
    setVolume,
    togglePlay,
    toggleSound,
    volume,
  }), [currentTime, currentTrack, duration, isPlaying, isSoundEnabled, loading, playTrack, togglePlay, volume]);

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        aria-hidden="true"
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error("useAudio must be used inside AudioProvider");
  return value;
}
