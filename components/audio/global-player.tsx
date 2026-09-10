"use client";

import { ChevronDown, ChevronUp, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "./audio-context";
import { Waveform } from "./waveform";
import { waveformFor } from "../../lib/catalogue";
import { localizedProduct, translations, type Language } from "../../lib/i18n";

type GlobalPlayerProps = {
  sessionCount: number;
  isCurrentTrackSelected: boolean;
  onAdd: () => void;
  onOpenSession: () => void;
  minimized: boolean;
  onMinimize: () => void;
  language: Language;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function GlobalPlayer({ sessionCount, isCurrentTrackSelected, onAdd, onOpenSession, minimized, onMinimize, language }: GlobalPlayerProps) {
  const { currentTrack, currentTime, duration, isPlaying, isSoundEnabled, loading, playTrack, seek, setVolume, togglePlay, toggleSound, volume } = useAudio();
  if (!currentTrack) return null;

  const waveform = waveformFor(currentTrack.preview);
  const progress = duration > 0 ? currentTime / duration : 0;
  const copy = translations[language];
  const display = localizedProduct(currentTrack, language);
  const seekCurrent = (ratio: number) => seek(ratio * (duration || waveform.duration));

  if (minimized) {
    return (
      <div className="mini-player" role="region" aria-label={`${copy.play} ${display.title}`}>
        <button className="mini-player-play" type="button" onClick={() => void togglePlay()} aria-label={isPlaying ? copy.pause : copy.play}>{isPlaying ? "Ⅱ" : "▶"}</button>
        <div className="mini-player-track"><strong>{display.title}</strong><span>{display.categoryLabel}</span></div>
        <Waveform peaks={waveform.peaks} progress={progress} label={`${copy.findIn} ${display.title}`} interactive onSeek={seekCurrent} tone="mint" />
        <span className="mini-player-time">{formatTime(currentTime)}</span>
        <button className="mini-player-expand" type="button" onClick={onMinimize} aria-label="Abrir reproductor"><ChevronUp size={16} /></button>
      </div>
    );
  }

  return (
    <div className="global-player" role="region" aria-label="SoundScape player">
      <button className="player-play" type="button" onClick={() => void togglePlay()} aria-label={isPlaying ? copy.pause : copy.play}>{loading ? "…" : isPlaying ? "Ⅱ" : "▶"}</button>
      <div className="player-track"><div className="player-track-info"><strong>{display.title}</strong><span>{display.categoryLabel} · {currentTrack.duration}</span></div><Waveform peaks={waveform.peaks} progress={progress} label={`${copy.findIn} ${display.title}`} interactive onSeek={seekCurrent} tone="mint" /></div>
      <span className="player-time">{formatTime(currentTime)} / {formatTime(duration || waveform.duration)}</span>
      <button className="player-sound" type="button" onClick={toggleSound} aria-label={isSoundEnabled ? "Silenciar sonido" : "Activar sonido"}>{isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
      <input className="player-volume" type="range" min="0" max="1" step="0.01" value={isSoundEnabled ? volume : 0} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volumen" />
      <button className={`player-session${isCurrentTrackSelected ? " is-selected" : ""}`} type="button" onClick={onAdd} aria-label={`${isCurrentTrackSelected ? copy.remove : copy.add} ${display.title}`}>{isCurrentTrackSelected ? copy.selection : `+ ${copy.selection}`}</button>
      <button className="player-session-count" type="button" onClick={onOpenSession} aria-label={copy.selection}>{sessionCount.toString().padStart(2, "0")}</button>
      <button className="player-collapse" type="button" onClick={onMinimize} aria-label="Minimizar reproductor"><ChevronDown size={16} /></button>
      <span className="sr-only">{copy.play} {display.title}</span>
      <button className="player-replay" type="button" onClick={() => { seek(0); if (!isPlaying) void playTrack(currentTrack); }} aria-label="Reproducir desde el principio">{language === "es" ? "Reiniciar" : "Restart"}</button>
    </div>
  );
}
