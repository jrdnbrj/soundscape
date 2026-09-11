"use client";

import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Check, ChevronLeft, ChevronRight, Maximize2, Menu, Minimize2, Pause, Play, Search, Volume2, VolumeX, X } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent } from "react";
import { GlobalPlayer } from "./audio/global-player";
import { AudioProvider, useAudio } from "./audio/audio-context";
import { Waveform } from "./audio/waveform";
import { audioCount, categories, formatPrice, products, projects, waveformFor, type Product } from "../lib/catalogue";
import { categoryFilterLabel, localizedProduct, localizedProjectType, translations, type Language } from "../lib/i18n";

gsap.registerPlugin(ScrollTrigger);

const SessionPanel = lazy(() => import("./soundscape-session-panel").then((module) => ({ default: module.SessionPanel })));

function ProductRow({ product, selected, onToggle, index, language }: { product: Product; selected: boolean; onToggle: () => void; index: number; language: Language }) {
  const { currentTrack, currentTime, duration, isPlaying, playTrack, seek } = useAudio();
  const copy = translations[language];
  const display = localizedProduct(product, language);
  const active = currentTrack?.id === product.id;
  const waveform = waveformFor(product.preview);
  const progress = active && duration > 0 ? currentTime / duration : 0;
  const handleSeek = (ratio: number) => {
    const target = ratio * (duration || waveform.duration);
    if (active) seek(target);
    else void playTrack(product, target);
  };

    return (
    <motion.article
      className={`sound-row${active ? " is-active" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.24) }}
    >
      <button className="row-play" type="button" onClick={() => void playTrack(product)} aria-label={`${active && isPlaying ? copy.pause : copy.play} ${display.title}`}>
        {active && isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      </button>
      <div className="row-title">
        <h3>{display.title}</h3>
        <span>{display.categoryLabel}</span>
      </div>
      <div className="row-wave"><Waveform peaks={waveform.peaks} progress={progress} label={`${copy.findIn} ${display.title}`} interactive onSeek={handleSeek} /></div>
      <span className="row-duration">{product.duration}</span>
      <strong className="row-price">{formatPrice(product.price)}</strong>
      <button className={`row-add${selected ? " is-selected" : ""}`} type="button" onClick={onToggle} aria-pressed={selected} aria-label={`${selected ? copy.remove : copy.add} ${display.title}`}>
        {selected ? <Check size={15} /> : "+"}
      </button>
      <p className="row-description">{display.description}</p>
    </motion.article>
  );
}

function formatVideoTime(value: number) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ProjectScene({ project, index, language }: { project: (typeof projects)[number]; index: number; language: Language }) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [playRequested, setPlayRequested] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoVolume, setVideoVolume] = useState(0.78);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const copy = translations[language];

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || typeof IntersectionObserver === "undefined") {
      setMediaReady(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setMediaReady(true);
      observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(media);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mediaReady || !playRequested || !videoRef.current) return;
    const video = videoRef.current;
    window.dispatchEvent(new CustomEvent("soundscape:video-play", { detail: project.title }));
    void video.play().catch(() => undefined);
    setPlayRequested(false);
  }, [mediaReady, playRequested, project.title]);

  useEffect(() => {
    const pauseOtherVideo = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== project.title) videoRef.current?.pause();
    };
    window.addEventListener("soundscape:video-play", pauseOtherVideo);
    return () => window.removeEventListener("soundscape:video-play", pauseOtherVideo);
  }, [project.title]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === mediaRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = videoVolume;
  }, [videoVolume]);

  useEffect(() => {
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    if (!playing) return;
    controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 1600);
    return () => {
      if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    };
  }, [playing]);

  const revealControls = () => {
    setControlsVisible(true);
    if (!playing) return;
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 1600);
  };

  const hideControls = () => {
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    setControlsVisible(false);
  };

  const toggleVideo = async () => {
    if (!videoRef.current) return;
    if (!mediaReady) {
      setMediaReady(true);
      setPlayRequested(true);
      return;
    }
    if (videoRef.current.paused) {
      window.dispatchEvent(new CustomEvent("soundscape:video-play", { detail: project.title }));
      await videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const seekVideo = (value: string) => {
    const nextTime = Number(value);
    if (!videoRef.current || !Number.isFinite(nextTime)) return;
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleFullscreen = async () => {
    const media = mediaRef.current;
    if (!media) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await media.requestFullscreen();
  };

  return (
    <article className={`project-scene project-scene-${index + 1}`}>
      <div className="project-scene-copy"><div><h3>{project.title}</h3><p>{localizedProjectType(project.type, language)}</p></div></div>
      <div ref={mediaRef} className={`project-media${playing ? " is-playing" : ""}${controlsVisible ? " controls-visible" : ""}`} onMouseMove={revealControls} onMouseLeave={hideControls} onPointerDown={revealControls} onFocusCapture={revealControls}>
        <video ref={videoRef} controls={false} preload={mediaReady ? "metadata" : "none"} playsInline muted={muted} poster={mediaReady ? project.poster : undefined} src={mediaReady ? project.video : undefined} onClick={() => void toggleVideo()} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onDurationChange={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={() => { window.dispatchEvent(new CustomEvent("soundscape:video-play", { detail: project.title })); setPlaying(true); }} onPause={() => { setPlaying(false); setControlsVisible(true); }} onEnded={() => { setPlaying(false); setControlsVisible(true); setCurrentTime(0); }} />
        <div className="project-media-shade" />
        <button className="project-play" type="button" onClick={(event) => { event.stopPropagation(); void toggleVideo(); revealControls(); }} aria-label={`${playing ? copy.pause : copy.play} ${project.title}`}>{playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}</button>
        <div className="project-controls" onClick={(event) => event.stopPropagation()}>
          <button className="project-control-button" type="button" onClick={() => void toggleVideo()} aria-label={playing ? copy.pause : copy.play}>{playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}</button>
          <label className="project-seek"><span className="sr-only">{language === "es" ? "Posición del vídeo" : "Video position"}</span><span className="project-seek-track"><span style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} /></span><input type="range" min="0" max={duration || 0.01} step="0.01" value={Math.min(currentTime, duration || 0)} onChange={(event) => seekVideo(event.target.value)} /></label>
          <span className="project-time">{formatVideoTime(currentTime)} / {formatVideoTime(duration)}</span>
          <button className="project-control-button" type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? (language === "es" ? "Activar sonido" : "Unmute") : (language === "es" ? "Silenciar vídeo" : "Mute video")}>{muted ? <VolumeX size={14} /> : <Volume2 size={14} />}</button>
          <label className="project-volume-wrap"><span className="sr-only">{language === "es" ? "Volumen del vídeo" : "Video volume"}</span><input className="project-volume" type="range" min="0" max="1" step="0.01" value={muted ? 0 : videoVolume} onChange={(event) => { const nextVolume = Number(event.target.value); setVideoVolume(nextVolume); setMuted(nextVolume === 0); }} /></label>
          <button className="project-control-button" type="button" onClick={() => void toggleFullscreen()} aria-label={isFullscreen ? (language === "es" ? "Salir de pantalla completa" : "Exit fullscreen") : (language === "es" ? "Pantalla completa" : "Fullscreen")}>{isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
        </div>
      </div>
    </article>
  );
}

function SoundScapePage() {
  const rootRef = useRef<main>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [playerMinimized, setPlayerMinimized] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>("es");
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Todos");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const pageSize = 12;
  const reducedMotion = useReducedMotion();
  const { currentTrack, isPlaying, isSoundEnabled, playTrack, toggleSound } = useAudio();
  const copy = translations[language];
  const fieldNote = products.find((product) => product.id === "AMB-013") ?? products[0];

  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const display = localizedProduct(product, language);
    const searchable = `${product.title} ${display.title} ${product.category} ${display.categoryLabel} ${product.tags.join(" ")} ${product.description} ${display.description}`.toLocaleLowerCase(language);
    return matchesCategory && (!query.trim() || searchable.includes(query.trim().toLocaleLowerCase(language)));
  });
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedProducts = visibleProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = window.requestAnimationFrame(raf); };
    frame = window.requestAnimationFrame(raf);
    return () => { window.cancelAnimationFrame(frame); lenis.destroy(); lenisRef.current = null; };
  }, [reducedMotion]);

  useEffect(() => {
    if (menuOpen && headerRef.current) gsap.set(headerRef.current, { clearProps: "transform" });
  }, [menuOpen]);

  useGSAP(() => {
    if (reducedMotion) return;
    const hero = heroRef.current;
    const header = headerRef.current;
    const shell = rootRef.current;
    const archive = rootRef.current?.querySelector<HTMLElement>(".archive-section");
    if (!hero || !header || !shell) return;

    const heroImageDuration = 1.5;
    const heroLiftDuration = 30.2;
    const heroFadeDuration = 9;
    const heroBackgroundTrackDuration = 1.4;
    const heroLetterReferenceDuration = 15.65;
    const heroScrollEnd = (duration: number, referenceDuration: number) => () => `+=${window.innerHeight * 1.75 * (duration / referenceDuration)}`;
    const heroTimeline = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "+=175%", scrub: true, pin: true, anticipatePin: 1 } });
    // Keep the background rhythm fixed while each hero control remains independently adjustable.
    heroTimeline.to({}, { duration: heroBackgroundTrackDuration }, 0).to(hero.querySelector(".hero-footer"), { opacity: 0, yPercent: 46, duration: 0.30, ease: "none" }, 0.04).to(hero.querySelector(".hero-field-shade"), { opacity: 0.96, ease: "none" }, 0.42).fromTo(hero.querySelector(".hero-wave"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "none" }, 0.24).to(hero.querySelector(".hero-wave"), { opacity: 0, yPercent: -18, ease: "none" }, 0.7);
    if (archive) {
      const archiveOverlap = () => window.innerHeight * 1.65;
      heroTimeline.fromTo(archive, { y: 0, marginBottom: 0 }, { y: () => -archiveOverlap(), marginBottom: () => -archiveOverlap(), duration: 0.52, ease: "power2.out" }, 0);
    }

    const heroImageTimeline = gsap.timeline({ scrollTrigger: { trigger: shell, start: "top top", end: heroScrollEnd(heroImageDuration, heroBackgroundTrackDuration), scrub: true } });
    heroImageTimeline.to(hero.querySelector(".hero-field-image"), { scale: 3.6, yPercent: -8, duration: heroImageDuration, ease: "none" }, 0);

    const heroLiftTimeline = gsap.timeline({ scrollTrigger: { trigger: shell, start: "top top", end: heroScrollEnd(heroLiftDuration + 0.15, heroLetterReferenceDuration), scrub: true } });
    heroLiftTimeline.to({}, { duration: 0.15 }, 0).to(hero.querySelector(".hero-field-content"), { yPercent: -220, duration: heroLiftDuration, ease: "none" }, 0.15);

    const heroFadeTimeline = gsap.timeline({ scrollTrigger: { trigger: shell, start: "top top", end: heroScrollEnd(heroFadeDuration + 0.02, heroLetterReferenceDuration), scrub: true } });
    heroFadeTimeline.to({}, { duration: 0.02 }, 0).to(hero.querySelector(".hero-field-content"), { opacity: 0, duration: heroFadeDuration, ease: "none" }, 0.02);

    gsap.utils.toArray<HTMLElement>(".project-media").forEach((media) => gsap.fromTo(media, { scale: 0.84 }, { scale: 1, ease: "none", scrollTrigger: { trigger: media, start: "top 92%", end: "center 42%", scrub: true } }));

    ScrollTrigger.create({ start: 72, end: "max", onUpdate: (self) => { gsap.to(header, { yPercent: self.direction === 1 && self.scroll() > 160 ? -120 : 0, duration: 0.42, ease: "power2.out", overwrite: true }); } });

    gsap.utils.toArray<HTMLElement>(".practice-section .section-label, .practice-heading h2, .projects-section .section-label, .projects-intro h2, .journal-section .section-label, .journal-copy h2").forEach((element) => {
      gsap.fromTo(element, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", immediateRender: false, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none play none", onRefresh: (self) => { if (self.progress > 0) gsap.set(element, { y: 0, opacity: 1 }); } } });
    });
    gsap.utils.toArray<HTMLElement>(".service-row, .project-scene-copy").forEach((element) => {
      gsap.fromTo(element, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: "power2.out", immediateRender: false, scrollTrigger: { trigger: element, start: "top 92%", toggleActions: "play none play none", onRefresh: (self) => { if (self.progress > 0) gsap.set(element, { y: 0, opacity: 1 }); } } });
    });
  }, { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true });

  const refreshScrollScene = () => {
    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    });
  };

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    window.history.pushState({}, "", `#${id}`);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -88, duration: 1.05, onComplete: refreshScrollScene });
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(refreshScrollScene, 450);
  };

  useEffect(() => {
    const scheduleRefresh = () => window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    });
    const initialFrame = scheduleRefresh();
    const delayedRefresh = window.setTimeout(scheduleRefresh, 220);
    window.addEventListener("hashchange", scheduleRefresh);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.clearTimeout(delayedRefresh);
      window.removeEventListener("hashchange", scheduleRefresh);
    };
  }, []);

  const toggleSelected = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <main ref={rootRef} className="soundscape-shell">
      <header ref={headerRef} className={`site-header${menuOpen ? " is-open" : ""}`}>
        <a className="brand" href="#top" onClick={(event) => scrollToSection(event, "top")} aria-label="SoundScape, volver arriba"><span>SOUNDSCAPE</span></a>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Navegación principal"><a href="#archive" onClick={(event) => { setMenuOpen(false); scrollToSection(event, "archive"); }}>{copy.nav.archive}</a><a href="#services" onClick={(event) => { setMenuOpen(false); scrollToSection(event, "services"); }}>{copy.nav.services}</a><a href="#projects" onClick={(event) => { setMenuOpen(false); scrollToSection(event, "projects"); }}>{copy.nav.projects}</a><a href="#contact" onClick={(event) => { setMenuOpen(false); scrollToSection(event, "contact"); }}>{copy.nav.contact}</a></nav>
        <div className="header-actions"><button className="language-toggle" type="button" onClick={() => setLanguage((current) => current === "es" ? "en" : "es")} aria-label={`Cambiar idioma a ${language === "es" ? "English" : "Español"}`}>{language.toUpperCase()} <span>/</span> {copy.language}</button><button className="sound-control" type="button" onClick={toggleSound} aria-label={isSoundEnabled ? "Desactivar sonido" : "Activar sonido"}>{isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>{isSoundEnabled ? copy.sound : copy.silent}</span></button><button className="session-trigger" type="button" onClick={() => setSessionOpen(true)} aria-label={`${copy.selection}, ${selected.length} elementos`}><span>{copy.selection}</span><b>{selected.length.toString().padStart(2, "0")}</b></button><button className="menu-trigger" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>

      <section ref={heroRef} className="hero-field" id="top">
        <Image className="hero-field-image" src="/media/brand/landscape.webp" alt="Logo oficial de SoundScape sobre un paisaje" fill priority fetchPriority="high" sizes="100vw" />
        <div className="hero-field-shade" />
        <div className="hero-field-content"><p className="hero-overline">{copy.heroOverline}</p><h1>{copy.heroTitle}<br /><em>{copy.heroTitleAccent}</em></h1><p className="hero-lede">{copy.heroLede}</p><button className="hero-listen" type="button" onClick={() => void playTrack(fieldNote)}>{currentTrack?.id === fieldNote.id && isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}<span>{currentTrack?.id === fieldNote.id && isPlaying ? copy.pause : copy.listenSample}</span></button></div>
        <div className="hero-footer"><span>SoundScape</span><span>{copy.fieldRecording} · 02:55</span><a href="#archive" onClick={(event) => scrollToSection(event, "archive")}>{copy.discoverArchive} <ArrowDown size={14} /></a></div>
        <div className="hero-wave" aria-hidden="true"><Waveform peaks={waveformFor(fieldNote.preview).peaks} progress={0} tone="mint" /></div>
      </section>

      <section className="archive-section" id="archive"><div className="section-shell"><div className="archive-intro"><div><p className="section-label">{copy.archiveLabel}</p><h2>{copy.archiveTitle}<br /><span>{copy.archiveTitleAccent}</span></h2></div><p className="archive-intro-copy">{copy.archiveIntro.replace("piezas", `${audioCount} piezas`).replace("pieces", `${audioCount} pieces`)}</p></div><div className="archive-toolbar"><div className="category-row" role="tablist" aria-label="Filtrar por categoría">{categories.map((category) => <button key={category} role="tab" aria-selected={activeCategory === category} type="button" className={activeCategory === category ? "is-active" : ""} onClick={() => { setActiveCategory(category); setPage(1); }}>{categoryFilterLabel(category, language)}</button>)}</div><button className={`search-trigger${searchOpen ? " is-active" : ""}`} type="button" onClick={() => setSearchOpen((open) => !open)} aria-expanded={searchOpen} aria-controls="archive-search"><Search size={15} /><span>{copy.search}</span></button></div><AnimatePresence initial={false}>{searchOpen && <motion.label id="archive-search" className="archive-search" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><Search size={15} /><span className="sr-only">{copy.search}</span><input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={copy.searchPlaceholder} /></motion.label>}</AnimatePresence><div className="archive-list">{paginatedProducts.map((product, index) => <ProductRow key={product.id} product={product} index={index} language={language} selected={selected.includes(product.id)} onToggle={() => toggleSelected(product.id)} />)}</div>{visibleProducts.length === 0 && <div className="archive-empty">{copy.noResults}</div>}{visibleProducts.length > pageSize && <nav className="archive-pagination" aria-label={language === "es" ? "Paginación del archivo" : "Archive pagination"}><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label={copy.previousPage}><ChevronLeft size={16} /></button><span className="archive-pagination-status">{copy.page} {currentPage} {copy.of} {pageCount}</span><button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount} aria-label={copy.nextPage}><ChevronRight size={16} /></button></nav>}<div className="archive-footer"><span>{visibleProducts.length} {copy.results}</span><a href="#contact" onClick={(event) => scrollToSection(event, "contact")}>{copy.specificSound} <ArrowUpRight size={14} /></a></div></div></section>

      <section className="practice-section" id="services"><div className="section-shell"><div className="practice-heading"><p className="section-label">{copy.practiceLabel}</p><h2>{copy.practiceTitle}<br />{copy.practiceTitleAccent}</h2><p>{copy.practiceCopy}</p></div><div className="service-list">{[copy.services.soundDesign, copy.services.music, copy.services.editingMix, copy.services.pictureAudio, copy.services.licensing].map((service) => <div className="service-row" key={service[0]}><h3>{service[0]}</h3><p>{service[1]}</p></div>)}</div></div></section>

      <section className="projects-section" id="projects"><div className="section-shell"><div className="projects-intro"><div><p className="section-label">{copy.projectsLabel}</p><h2>{copy.projectsTitle}<br /><span>{copy.projectsTitleAccent}</span></h2></div><p>{copy.projectsCopy}</p></div><div className="projects-stack">{projects.map((project, index) => <ProjectScene key={project.title} project={project} index={index} language={language} />)}</div></div></section>

      <section className="journal-section" id="journal"><div className="section-shell journal-grid"><div className="journal-visual"><div className="journal-visual-main"><Image src="/media/portfolio/posters/ok-google.webp" alt="Imagen de proyecto audiovisual de SoundScape" fill sizes="(max-width: 760px) 86vw, 36vw" /></div><div className="journal-visual-logo"><Image src="/media/brand/icon-texture.webp" alt="Logo oficial de SoundScape" fill sizes="26vw" /></div><div className="journal-visual-line" aria-hidden="true" /><div className="journal-visual-caption"><span>{copy.journalVisualCaption}</span><span>SoundScape</span></div><div className="journal-visual-wave" aria-hidden="true"><Waveform peaks={waveformFor(fieldNote.preview).peaks} tone="mint" /></div></div><div className="journal-copy"><p className="section-label">{copy.aboutLabel}</p><h2>{copy.aboutTitle}<br /><span>{copy.aboutTitleAccent}</span></h2><p>{copy.aboutCopy}</p><a className="line-button" href="#contact" onClick={(event) => scrollToSection(event, "contact")}>{copy.talkProject} <ArrowUpRight size={15} /></a></div></div></section>

      <section className="contact-section" id="contact"><div className="section-shell contact-grid"><div><p className="section-label">{copy.contactLabel}</p><h2>{copy.contactTitle}<br /><span>{copy.contactTitleAccent}</span></h2></div><div className="contact-copy"><p>{copy.contactCopy}</p><a className="contact-email" href={`https://wa.me/346327333266?text=${encodeURIComponent(copy.generalMessage)}`} target="_blank" rel="noreferrer">{copy.whatsapp} <ArrowUpRight size={18} /></a><p className="contact-meta">{copy.contactMeta}</p></div></div><div className="contact-strip"><span>SoundScape</span><span>{copy.contactArtist ?? "Dario Silva"}</span><span>{copy.whatsapp}</span></div></section>

      <footer className="site-footer"><a className="brand" href="#top" onClick={(event) => scrollToSection(event, "top")}><span>SOUNDSCAPE</span></a><span>{language === "es" ? "Diseño sonoro · música · campo" : "Sound design · music · field"}</span><span>© 2026</span></footer>

      <AnimatePresence>{currentTrack && <motion.div className="player-space" initial={{ height: 0 }} animate={{ height: playerMinimized ? 58 : 112 }} exit={{ height: 0 }} />}</AnimatePresence>
      <GlobalPlayer sessionCount={selected.length} isCurrentTrackSelected={Boolean(currentTrack && selected.includes(currentTrack.id))} onAdd={() => currentTrack && toggleSelected(currentTrack.id)} onOpenSession={() => setSessionOpen(true)} minimized={playerMinimized} onMinimize={() => setPlayerMinimized((value) => !value)} language={language} />
      {sessionOpen && <Suspense fallback={null}><SessionPanel selected={selected} language={language} onClose={() => setSessionOpen(false)} onRemove={(id) => setSelected((items) => items.filter((item) => item !== id))} /></Suspense>}
    </main>
  );
}

export default function SoundScapeExperience() {
  return <AudioProvider><SoundScapePage /></AudioProvider>;
}
