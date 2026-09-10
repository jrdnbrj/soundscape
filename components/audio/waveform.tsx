"use client";

import { useRef } from "react";

type WaveformProps = {
  peaks: number[];
  progress?: number;
  label?: string;
  interactive?: boolean;
  onSeek?: (ratio: number) => void;
  tone?: "mint" | "ink" | "orange";
};

export function Waveform({ peaks, progress = 0, label = "Forma de onda", interactive = false, onSeek, tone = "mint" }: WaveformProps) {
  const pointerRef = useRef<number | null>(null);

  const seekFromPointer = (clientX: number, element: HTMLDivElement) => {
    if (!onSeek) return;
    const bounds = element.getBoundingClientRect();
    onSeek(Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)));
  };

  return (
    <div
      className={`waveform-real waveform-${tone}${interactive ? " waveform-interactive" : ""}`}
      role={interactive ? "slider" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? label : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-valuenow={interactive ? Math.round(progress * 100) : undefined}
      aria-valuetext={interactive ? `${Math.round(progress * 100)}%` : undefined}
      onPointerDown={(event) => {
        if (!interactive || !onSeek) return;
        pointerRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        seekFromPointer(event.clientX, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (interactive && pointerRef.current === event.pointerId) seekFromPointer(event.clientX, event.currentTarget);
      }}
      onPointerUp={(event) => {
        if (pointerRef.current !== event.pointerId) return;
        pointerRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { pointerRef.current = null; }}
      onKeyDown={(event) => {
        if (!interactive || !onSeek) return;
        if (event.key === "ArrowRight") onSeek(Math.min(1, progress + 0.04));
        if (event.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.04));
        if (event.key === "Home") onSeek(0);
        if (event.key === "End") onSeek(1);
      }}
    >
      <div className="waveform-bars" aria-hidden="true">
        {peaks.map((peak, index) => (
          <span
            key={`${index}-${peak}`}
            className={index / peaks.length <= progress ? "is-played" : ""}
            style={{ height: `${Math.max(8, Math.round(peak * 92))}%` }}
          />
        ))}
      </div>
    </div>
  );
}
