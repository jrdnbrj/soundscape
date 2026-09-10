"use client";

import { Volume2, VolumeX, X } from "lucide-react";
import { useAudio } from "./audio-context";
import { Waveform } from "./waveform";
import { formatPrice, waveformFor } from "../../lib/catalogue";

type GlobalPlayerProps = {
  sessionCount: number;
  isCurrentTrackSelected: boolean;
  onAdd: () => void;
  onOpenSession: () => void;
  minimized: boolean;
  onMinimize: () => void;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function GlobalPlayer({ sessionCount, isCurrentTrackSelected, onAdd, onOpenSession, minimized, onMinimize }: GlobalPlayerProps) {
  const { currentTrack, currentTime, duration, isPlaying, isSoundEnabled, loading, playTrack, seek, setVolume, togglePlay, toggleSound, volume } = useAudio();
  if (!currentTrack) return null;

  const waveform = waveformFor(currentTrack.preview);
  const progress = duration > 0 ? currentTime / duration : 0;

  if (minimized) {
    return <button className="mini-player" type="button" onClick={onMinimize} aria-label={`Abrir reproductor de ${currentTrack.title}`}><span className="mini-player-dot" /> <strong>{currentTrack.id}</strong><span>{currentTrack.title}</span><Waveform peaks={waveform.peaks} progress={progress} tone="mint" /></button>;
  }

  return (
    <div className="global-player" role="region" aria-label="Reproductor de SoundScape">
      <button className="player-close" type="button" onClick={onMinimize} aria-label="Minimizar reproductor"><X size={15} /></button>
      <button className="player-play" type="button" onClick={() => void togglePlay()} aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}>
        <span>{loading ? "…" : isPlaying ? "Ⅱ" : "▶"}</span>
      </button>
      <div className="player-track">
        <div className="player-track-info">
          <span>{currentTrack.id} · {currentTrack.category}</span>
          <strong>{currentTrack.title}</strong>
        </div>
        <Waveform
          peaks={waveform.peaks}
          progress={progress}
          label={`Buscar en ${currentTrack.title}`}
          interactive
          onSeek={(ratio) => seek(ratio * duration)}
          tone="mint"
        />
      </div>
      <span className="player-time">{formatTime(currentTime)} / {formatTime(duration || waveform.duration)}</span>
      <button className="player-sound" type="button" onClick={toggleSound} aria-label={isSoundEnabled ? "Silenciar sonido" : "Activar sonido"}>
        {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      <input className="player-volume" type="range" min="0" max="1" step="0.01" value={isSoundEnabled ? volume : 0} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volumen" />
      <button className={`player-session${isCurrentTrackSelected ? " is-selected" : ""}`} type="button" onClick={onAdd} aria-label={`${isCurrentTrackSelected ? "Quitar" : "Añadir"} ${currentTrack.title} ${isCurrentTrackSelected ? "de" : "a"} la sesión`}>
        {isCurrentTrackSelected ? "✓ IN SESSION" : "+ SESSION"}
      </button>
      <button className="player-session-count" type="button" onClick={onOpenSession}>
        {sessionCount.toString().padStart(2, "0")}
      </button>
      <button className="player-replay" type="button" onClick={() => void playTrack(currentTrack)} aria-label="Reproducir desde el principio">REPLAY</button>
      <span className="sr-only">Precio orientativo: {formatPrice(currentTrack.price)}</span>
    </div>
  );
}
