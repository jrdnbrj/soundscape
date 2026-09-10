"use client";

import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Lenis from "lenis";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Check, Menu, Pause, Play, Search, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlobalPlayer } from "./audio/global-player";
import { AudioProvider, useAudio } from "./audio/audio-context";
import { Waveform } from "./audio/waveform";
import { FieldCanvas } from "./field/field-canvas";
import { audioCount, categories, feelingTags, formatPrice, products, projects, waveformFor, type Product } from "../lib/catalogue";

gsap.registerPlugin(useGSAP);

function SoundMark({ small = false }: { small?: boolean }) {
  return (
    <svg className={small ? "sound-mark sound-mark-small" : "sound-mark"} viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <path d="M7 27.4c5.9-1.8 9.7-5.1 13-12.7 2.6 7.3 5.1 11.3 9.6 10.1 2.1-.5 3.7-1.9 5.4-4.1" />
      <path d="M7 33c5.6-1.7 10.3-5.1 13.2-10.2 2.8-4.9 4.2-10.6 7.4-13.1" />
      <path d="M7 9.2h5.5M29.4 32.8H35" />
    </svg>
  );
}

function TransmissionGate({ onEnter }: { onEnter: (withSound: boolean) => void }) {
  return (
    <AnimatePresence>
      <motion.div className="transmission-gate" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }} transition={{ duration: 0.55 }}>
        <div className="transmission-grid" aria-hidden="true" />
        <div className="transmission-inner">
          <p className="mono-kicker">FIELD TRANSMISSION / 013</p>
          <div className="transmission-brand"><SoundMark /><span>SOUNDSCAPE</span></div>
          <p className="transmission-note">Un archivo vivo de sonido, imagen, espacio y movimiento.</p>
          <div className="transmission-actions">
            <button className="signal-button signal-button-primary" type="button" onClick={() => onEnter(true)}>Enter / enable sound <ArrowDownRight size={15} /></button>
            <button className="signal-button" type="button" onClick={() => onEnter(false)}>Enter without sound</button>
          </div>
          <p className="transmission-footer">HEADPHONES RECOMMENDED · NO AUDIO STARTS AUTOMATICALLY</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ProductCard({ product, selected, onToggle }: { product: Product; selected: boolean; onToggle: () => void }) {
  const { currentTrack, currentTime, duration, isPlaying, playTrack } = useAudio();
  const waveform = waveformFor(product.preview);
  const active = currentTrack?.id === product.id;
  const progress = active && duration > 0 ? currentTime / duration : 0;

  return (
    <motion.article className={`archive-card archive-card-${product.accent}${active ? " is-active" : ""}`} layout transition={{ duration: 0.35 }}>
      <div className="archive-card-topline"><span>{product.id}</span><span>{product.label}</span></div>
      <div className="archive-index" aria-hidden="true">{product.id.replace("-", "")}</div>
      <div className="archive-card-copy">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <div className="archive-tags">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
      <div className="archive-card-wave">
        <Waveform peaks={waveform.peaks} progress={progress} label={`Buscar en ${product.title}`} />
        <span>{product.duration}</span>
      </div>
      <div className="archive-card-footer">
        <button className="archive-play" type="button" onClick={() => void playTrack(product)} aria-label={`${active && isPlaying ? "Pausar" : "Reproducir"} ${product.title}`}>
          {active && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <span className="archive-license">licencia individual</span>
        <strong>{formatPrice(product.price)}</strong>
        <button className={`archive-add ${selected ? "is-selected" : ""}`} type="button" onClick={onToggle} aria-pressed={selected}>
          {selected ? <Check size={14} /> : <span>+</span>} {selected ? "en session" : "session"}
        </button>
      </div>
    </motion.article>
  );
}

function FieldExplorer({ visibleProducts }: { visibleProducts: Product[] }) {
  const { currentTrack, playTrack } = useAudio();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="field-explorer" aria-label="Campo sonoro de la biblioteca">
      <div className="field-axis field-axis-x"><span>ORGÁNICO</span><span>SINTÉTICO</span></div>
      <div className="field-axis field-axis-y"><span>ÍNTIMO</span><span>EXPANSIVO</span></div>
      <div className="field-orbit field-orbit-one" aria-hidden="true" />
      <div className="field-orbit field-orbit-two" aria-hidden="true" />
      <div className="field-center"><SoundMark /><span>LISTENING<br />FIELD</span></div>
      {visibleProducts.map((product) => (
        <motion.button
          key={product.id}
          className={`field-node field-node-${product.accent}${currentTrack?.id === product.id ? " is-playing" : ""}`}
          layout
          animate={{ left: `${product.axis.x}%`, top: `${product.axis.y}%` }}
          transition={{ type: "spring", stiffness: 170, damping: 22 }}
          type="button"
          onClick={() => void playTrack(product)}
          onMouseEnter={() => setHovered(product.id)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(product.id)}
          onBlur={() => setHovered(null)}
          aria-label={`Escuchar ${product.title}`}
        >
          <span className="field-node-ring" />
          <span className="field-node-core" />
          {(hovered === product.id || currentTrack?.id === product.id) && <span className="field-node-label"><b>{product.id}</b>{product.title}</span>}
        </motion.button>
      ))}
      <p className="field-instruction">Cada punto es una pieza del archivo · selecciona para escuchar</p>
    </div>
  );
}

function ProjectCard({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggleVideo = async () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) await videoRef.current.play();
    else videoRef.current.pause();
  };

  return (
    <motion.article className="project-frame" data-reveal layout>
      <div className="project-frame-meta"><span>{project.number} / 03</span><span>{project.type}</span></div>
      <div className={`project-media project-media-${index + 1}`}>
        <video
          ref={videoRef}
          controls={playing}
          preload="none"
          playsInline
          poster={project.poster}
          src={project.video}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        <div className="project-media-overlay" />
        <button className="project-play" type="button" onClick={() => void toggleVideo()} aria-label={`${playing ? "Pausar" : "Reproducir"} proyecto ${project.title}`}>
          {playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}
        </button>
        <span className="project-listen-label">{playing ? "playing / sound design" : "play project"}</span>
      </div>
      <div className="project-frame-copy"><div><p className="mono-kicker">PROJECT / {project.number}</p><h3>{project.title}</h3></div><ArrowUpRight size={19} /></div>
    </motion.article>
  );
}

function SessionPanel({ selected, onClose, onRemove }: { selected: string[]; onClose: () => void; onRemove: (id: string) => void }) {
  const { playTrack } = useAudio();
  return (
    <AnimatePresence>
      <motion.div className="session-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.aside className="session-panel" role="dialog" aria-modal="true" aria-labelledby="session-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }} onClick={(event) => event.stopPropagation()}>
          <div className="session-header"><div><p className="mono-kicker">SOUNDSCAPE / SESSION</p><h2 id="session-title">Una escucha<br /><em>en proceso.</em></h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar session"><X size={19} /></button></div>
          <div className="session-meta"><span>TRACKS / {selected.length.toString().padStart(2, "0")}</span><span>LICENSING PREVIEW</span></div>
          {selected.length === 0 ? <div className="session-empty"><SoundMark /><p>Añade piezas del archivo para construir una sesión de escucha.</p><button className="signal-button signal-button-dark" type="button" onClick={onClose}>Volver al archivo</button></div> : (
            <div className="session-track-list">
              {selected.map((id) => {
                const product = products.find((item) => item.id === id);
                if (!product) return null;
                const waveform = waveformFor(product.preview);
                return <div className="session-track" key={id}><div className="session-track-number">{id}</div><div className="session-track-main"><strong>{product.title}</strong><span>{product.category} · {product.duration}</span><Waveform peaks={waveform.peaks} tone="ink" /></div><button className="session-track-play" type="button" onClick={() => void playTrack(product)} aria-label={`Reproducir ${product.title}`}><Play size={13} fill="currentColor" /></button><button className="session-track-remove" type="button" onClick={() => onRemove(id)} aria-label={`Quitar ${product.title}`}><X size={14} /></button></div>;
              })}
              <div className="session-tools"><span>SESSION READY</span><span>PREVIEW ONLY</span></div>
              <a className="session-cta" href={`mailto:hola@soundscape.audio?subject=SoundScape%20Session%20${selected.join(",%20")}&body=Me%20interesan%20estas%20piezas:%20${selected.join(",%20")}`} onClick={onClose}>Consultar licencias <ArrowUpRight size={16} /></a>
            </div>
          )}
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function SoundScapePage() {
  const rootRef = useRef<main>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [playerMinimized, setPlayerMinimized] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Todos");
  const [query, setQuery] = useState("");
  const [libraryMode, setLibraryMode] = useState<"archive" | "field">("archive");
  const [probe, setProbe] = useState({ x: 50, y: 50 });
  const reducedMotion = useReducedMotion();
  const { currentTrack, isPlaying, isSoundEnabled, playTrack, toggleSound } = useAudio();
  const fieldNote = products.find((product) => product.id === "AMB-013") ?? products[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setGateOpen(window.sessionStorage.getItem("soundscape-entered") !== "yes"));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (gateOpen) document.body.classList.add("is-gated");
    else document.body.classList.remove("is-gated");
    return () => document.body.classList.remove("is-gated");
  }, [gateOpen]);

  useGSAP(() => {
    if (reducedMotion) return;
    const elements = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    elements.forEach((element) => {
      gsap.fromTo(element, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
    });
  }, { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true });

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    frame = window.requestAnimationFrame(raf);
    return () => { window.cancelAnimationFrame(frame); lenis.destroy(); };
  }, [reducedMotion]);

  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const searchable = `${product.title} ${product.category} ${product.tags.join(" ")} ${product.description}`.toLocaleLowerCase("es");
    return matchesCategory && (!query.trim() || searchable.includes(query.trim().toLocaleLowerCase("es")));
  });

  const enterExperience = (withSound: boolean) => {
    if (withSound && !isSoundEnabled) toggleSound();
    if (!withSound && isSoundEnabled) toggleSound();
    window.sessionStorage.setItem("soundscape-entered", "yes");
    setGateOpen(false);
  };

  const toggleSelected = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <main ref={rootRef} className="soundscape-shell">
      {gateOpen && <TransmissionGate onEnter={enterExperience} />}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SoundScape, volver arriba"><SoundMark small /><span>SOUNDSCAPE</span></a>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Navegación principal">
          <a href="#archive" onClick={() => setMenuOpen(false)}>Archivo</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Práctica</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Proyectos</a>
          <a href="#journal" onClick={() => setMenuOpen(false)}>Journal</a>
        </nav>
        <div className="header-actions">
          <button className="sound-control" type="button" onClick={toggleSound} aria-label={isSoundEnabled ? "Desactivar sonido" : "Activar sonido"}>{isSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />} <span>{isSoundEnabled ? "SOUND ON" : "SOUND OFF"}</span></button>
          <button className="session-trigger" type="button" onClick={() => setSessionOpen(true)} aria-label={`Abrir session, ${selected.length} elementos`}><span>SESSION /</span>{selected.length.toString().padStart(2, "0")}</button>
          <button className="menu-trigger" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>

      <section className="hero-field" id="top" onPointerMove={(event) => { if (event.pointerType !== "touch") { const bounds = event.currentTarget.getBoundingClientRect(); setProbe({ x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 }); } }}>
        <Image className="hero-field-image" src="/media/brand/landscape.jpg" alt="Paisaje de montaña de SoundScape" fill priority sizes="100vw" />
        <div className="hero-field-shade" />
        <FieldCanvas />
        <div className="field-probe" style={{ left: `${probe.x}%`, top: `${probe.y}%` }} aria-hidden="true"><span className="field-probe-cross" /><span className="field-probe-label">FIELD PROBE / MOVE</span></div>
        <div className="hero-field-content" data-reveal>
          <p className="mono-kicker"><span className="live-dot" /> Signal found / field note 013</p>
          <h1>El sonido también<br /><em>es materia.</em></h1>
          <p className="hero-lede">Un archivo vivo de grabaciones, música y diseño sonoro para imágenes que todavía están buscando su forma.</p>
          <div className="hero-field-actions"><button className="signal-button signal-button-primary" type="button" onClick={() => void playTrack(fieldNote)}>{currentTrack?.id === fieldNote.id && isPlaying ? "Pause field note" : "Listen to field note"} {currentTrack?.id === fieldNote.id && isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}</button><a className="signal-button" href="#archive">Enter the living archive <ArrowDownRight size={15} /></a></div>
        </div>
        <div className="hero-field-readout"><span>FIELD NOTE / 013</span><span>RÍO SEGURA</span><span>LISTENING FIELD</span></div>
        <div className="hero-field-stamp"><SoundMark /><span>SCAPE<br />2024—26</span></div>
        <div className="hero-field-bottom"><span>ECUADOR · ESPAÑA · REMOTE</span><span>01 / TRANSMISSION</span><span>SCROLL TO LISTEN ↓</span></div>
      </section>

      <section className="statement-band" aria-label="Principios de SoundScape"><span>Escuchar primero</span><i /><span>Grabar afuera</span><i /><span>Diseñar con intención</span><i /><span>Dejar espacio</span></section>

      <section className="archive-section" id="archive">
        <div className="section-shell archive-shell" data-reveal>
          <div className="section-heading archive-heading"><div><p className="mono-kicker">02 / The living archive</p><h2>Escucha antes<br /><em>de elegir.</em></h2></div><div className="section-heading-aside"><span className="archive-count">{audioCount} <small>piezas<br />en el archivo</small></span><p>Cada sonido conserva su espacio, su textura y su propia forma de entrar en una escena.</p></div></div>
          <div className="archive-controls"><div className="mode-switch" role="tablist" aria-label="Modo de exploración"><button type="button" className={libraryMode === "archive" ? "is-active" : ""} onClick={() => setLibraryMode("archive")}>ARCHIVE</button><button type="button" className={libraryMode === "field" ? "is-active" : ""} onClick={() => setLibraryMode("field")}>FIELD</button></div><label className="archive-search"><Search size={15} /><span className="sr-only">Buscar en el archivo</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="buscar por sensación…" /></label></div>
          <div className="feeling-row"><span>SEARCH BY FEELING</span>{feelingTags.map((tag) => <button type="button" key={tag} className={query === tag ? "is-active" : ""} onClick={() => setQuery(query === tag ? "" : tag)}>{tag}</button>)}</div>
          <div className="category-row" role="tablist" aria-label="Filtrar por categoría">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? "is-active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
          <AnimatePresence mode="wait">{libraryMode === "archive" ? <motion.div key="archive" className="archive-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>{visibleProducts.map((product) => <ProductCard key={product.id} product={product} selected={selected.includes(product.id)} onToggle={() => toggleSelected(product.id)} />)}</motion.div> : <motion.div key="field" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><FieldExplorer visibleProducts={visibleProducts} /></motion.div>}</AnimatePresence>
          {visibleProducts.length === 0 && <div className="archive-empty">No hay piezas con esta sensación todavía. Prueba otra palabra o vuelve a abrir el campo.</div>}
          <div className="archive-footer"><span>Mostrando {visibleProducts.length} piezas de una primera selección curada.</span><a href="#contact">¿Necesitas un sonido específico? <ArrowUpRight size={14} /></a></div>
        </div>
      </section>

      <section className="session-capsule-section"><div className="section-shell"><div className="session-capsule" data-reveal><div className="capsule-mark"><span>03</span><div className="capsule-wave" aria-hidden="true">{Array.from({ length: 17 }, (_, index) => <i key={index} style={{ height: `${22 + ((index * 23) % 68)}%` }} />)}</div></div><div className="capsule-copy"><p className="mono-kicker">Build a listening session</p><h2>Un pequeño archivo<br /><em>para empezar.</em></h2><p>Selecciona algunas piezas, ordénalas y envía una consulta de licencia cuando la imagen encuentre su sonido.</p><button className="text-link" type="button" onClick={() => setSessionOpen(true)}>Abrir session <ArrowUpRight size={15} /></button></div><div className="capsule-data"><span>STARTER PACK</span><strong>10—15</strong><small>piezas representativas<br />próximo lanzamiento</small></div></div></div></section>

      <section className="practice-section" id="services"><div className="section-shell" data-reveal><div className="section-heading"><div><p className="mono-kicker">04 / Practice</p><h2>Cuando la imagen<br /><em>necesita otra capa.</em></h2></div><p className="section-intro">Diseño sonoro, producción musical y mezcla para cine, vídeo, videojuegos e instalaciones.</p></div><div className="practice-grid">{["Diseño sonoro", "Producción musical", "Mezcla y postproducción"].map((service, index) => <a className="practice-card" href="#contact" key={service}><span className="practice-index">0{index + 1}</span><h3>{service}</h3><p>{["Foley, ambientes y efectos que sostienen la imagen sin competir con ella.", "Música original, texturas y piezas pensadas para la narrativa del proyecto.", "Un espacio claro para voces, imagen y todos los detalles que hacen creíble una escena."][index]}</p><ArrowUpRight className="practice-arrow" size={19} /></a>)}</div></div></section>

      <section className="projects-section" id="projects"><div className="section-shell" data-reveal><div className="section-heading projects-heading"><div><p className="mono-kicker">05 / Moving image</p><h2>El sonido también<br /><em>cuenta historias.</em></h2></div><a className="text-link" href="#contact">Trabajemos juntos <ArrowUpRight size={15} /></a></div><div className="projects-stack">{projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}</div></div></section>

      <section className="journal-section" id="journal"><div className="section-shell journal-grid" data-reveal><div className="journal-visual"><Image src="/media/brand/icon-texture.png" alt="Textura del símbolo SoundScape" fill sizes="(max-width: 760px) 100vw, 50vw" /><div className="journal-visual-label"><span>FIELD JOURNAL</span><span>PROCESS / MATERIAL</span></div></div><div className="journal-copy"><p className="mono-kicker">06 / Field journal</p><h2>Un oído puesto<br />en el <em>paisaje.</em></h2><p>SoundScape nace de grabar lo que normalmente queda fuera de campo: la habitación antes de la acción, el metal, el agua, una voz lejana. Una biblioteca propia y un estudio abierto a proyectos que necesitan sonido con identidad.</p><div className="journal-note"><span>NOTES ON LISTENING</span><strong>“Dejar espacio también es una forma de composición.”</strong></div><a className="text-link" href="#contact">Conocer el proceso <ArrowUpRight size={15} /></a></div></div></section>

      <section className="contact-section" id="contact"><div className="section-shell contact-grid" data-reveal><div><p className="mono-kicker">07 / Contact</p><h2>Cuéntame qué<br /><em>estás escuchando.</em></h2></div><div className="contact-panel"><p>Para licencias, encargos, colaboraciones o una pregunta concreta sobre el archivo:</p><a className="contact-email" href="mailto:hola@soundscape.audio">hola@soundscape.audio <ArrowUpRight size={18} /></a><div className="contact-rule" /><div className="contact-small"><span>Diseño sonoro / música / campo</span><span>Ecuador · España · remoto</span></div></div></div></section>

      <footer className="site-footer"><a className="brand" href="#top"><SoundMark small /><span>SOUNDSCAPE</span></a><span>THE LIVING ARCHIVE</span><span>© 2026 SOUNDSCAPE</span></footer>

      <AnimatePresence>{currentTrack && <motion.div className="player-space" initial={{ height: 0 }} animate={{ height: 105 }} exit={{ height: 0 }} />}</AnimatePresence>
      <GlobalPlayer sessionCount={selected.length} isCurrentTrackSelected={Boolean(currentTrack && selected.includes(currentTrack.id))} onAdd={() => currentTrack && toggleSelected(currentTrack.id)} onOpenSession={() => setSessionOpen(true)} minimized={playerMinimized} onMinimize={() => setPlayerMinimized((value) => !value)} />
      {sessionOpen && <SessionPanel selected={selected} onClose={() => setSessionOpen(false)} onRemove={(id) => setSelected((items) => items.filter((item) => item !== id))} />}
    </main>
  );
}

export default function SoundScapeExperience() {
  return <AudioProvider><SoundScapePage /></AudioProvider>;
}
