"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "../audio/audio-context";

type Particle = { x: number; y: number; size: number; speed: number; phase: number };

export function FieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { metricsRef, isPlaying } = useAudio();
  const playingRef = useRef(isPlaying);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const particles: Particle[] = Array.from({ length: 80 }, (_, index) => ({
      x: (index * 37) % 100,
      y: (index * 61) % 100,
      size: 0.6 + ((index * 13) % 16) / 10,
      speed: 0.04 + ((index * 7) % 10) / 220,
      phase: index * 0.73,
    }));
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const metrics = metricsRef.current;
      const energy = playingRef.current ? metrics.amplitude : 0.04;
      const bass = playingRef.current ? metrics.bass : 0.05;
      const treble = playingRef.current ? metrics.treble : 0.04;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";

      const horizon = height * (0.58 + bass * 0.08);
      for (let line = 0; line < 10; line += 1) {
        const depth = line / 9;
        const yBase = horizon + depth * height * 0.34;
        context.beginPath();
        for (let x = 0; x <= width; x += Math.max(18, width / 50)) {
          const normalizedX = x / width;
          const wave = Math.sin(normalizedX * 7.5 + time * 0.00016 + line) * (2 + energy * 14 * (1 - depth));
          const ripple = Math.sin(normalizedX * 21 - time * 0.00028 + line * 1.7) * (1 + treble * 8);
          const y = yBase + wave + ripple;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = `rgba(185, 245, 219, ${0.05 + energy * 0.22 * (1 - depth)})`;
        context.lineWidth = depth > 0.5 ? 0.7 : 1;
        context.stroke();
      }

      for (const particle of particles) {
        const drift = reducedMotion.matches ? 0 : time * particle.speed;
        const x = ((particle.x / 100) * width + Math.sin(particle.phase + drift * 0.001) * (3 + treble * 16) + width) % width;
        const y = ((particle.y / 100) * height + Math.cos(particle.phase + drift * 0.0007) * (2 + energy * 12) + height) % height;
        const alpha = 0.12 + energy * 0.42;
        context.fillStyle = particle.phase % 2 > 1 ? `rgba(255, 118, 91, ${alpha * 0.58})` : `rgba(185, 245, 219, ${alpha})`;
        context.beginPath();
        context.arc(x, y, particle.size + energy * 1.4, 0, Math.PI * 2);
        context.fill();
      }

      context.globalCompositeOperation = "source-over";
      if (!reducedMotion.matches) frame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = window.requestAnimationFrame(draw);

    const onMotionPreferenceChange = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(draw);
    };
    reducedMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      window.cancelAnimationFrame(frame);
    };
  }, [metricsRef]);

  return <canvas ref={canvasRef} className="field-canvas" aria-hidden="true" />;
}
