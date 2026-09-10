"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Headphones,
  Menu,
  Pause,
  Play,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";

type Category = "Ambientes" | "Música audiovisual" | "Música contemporánea" | "SFX";

type Product = {
  id: string;
  title: string;
  category: Category;
  label: string;
  description: string;
  duration: string;
  price: number;
  preview: string;
  tags: string[];
};

const products: Product[] = [
  {
    id: "AMB-001",
    title: "Alcantarilla · Ambiente",
    category: "Ambientes",
    label: "Campo / textura",
    description: "Una textura subterránea, húmeda y cercana para construir espacio.",
    duration: "1:04",
    price: 6.9,
    preview: "/media/audio/AMB-001__ALCANTARILLA.mp3",
    tags: ["campo", "agua"],
  },
  {
    id: "AMB-005",
    title: "Lluvia · Ambiente",
    category: "Ambientes",
    label: "Atmósfera",
    description: "Lluvia continua y abierta para capas, transiciones y escenas suspendidas.",
    duration: "1:53",
    price: 6.9,
    preview: "/media/audio/AMB-005__AMBIENTE_LLUVIA.mp3",
    tags: ["lluvia", "atmósfera"],
  },
  {
    id: "AMB-013",
    title: "Río Segura · Ambiente de campo",
    category: "Ambientes",
    label: "Murcia / 3 canales",
    description: "Grabación de campo de larga duración con perspectiva amplia y orgánica.",
    duration: "2:55",
    price: 9.9,
    preview: "/media/audio/AMB-013__MURCIA_RIO_SEGURA.mp3",
    tags: ["Murcia", "río", "3ch"],
  },
  {
    id: "MAV-005",
    title: "Impacto",
    category: "Música audiovisual",
    label: "Música / FX",
    description: "Un gesto de tensión breve para marcar un corte, una entrada o una revelación.",
    duration: "2:20",
    price: 14.9,
    preview: "/media/audio/MAV-005__MUSICA_FX_IMPACTO.mp3",
    tags: ["impacto", "cine"],
  },
  {
    id: "MUS-004",
    title: "Luxury · MMIX 1",
    category: "Música contemporánea",
    label: "Pista completa",
    description: "La versión principal seleccionada para presentar el universo contemporáneo de SoundScape.",
    duration: "4:52",
    price: 24.9,
    preview: "/media/audio/MUS-004__LUXURY_MMIX_1.mp3",
    tags: ["contemporánea", "master"],
  },
  {
    id: "MUS-009",
    title: "Satanic Church",
    category: "Música contemporánea",
    label: "Pista completa",
    description: "Una pieza oscura y ceremonial para imagen, instalación y narrativas de alta tensión.",
    duration: "4:18",
    price: 19.9,
    preview: "/media/audio/MUS-009__SATANIC_CHURCH.mp3",
    tags: ["oscuro", "ceremonial"],
  },
  {
    id: "SFX-001",
    title: "Agua bajo suelo · Palacio 01",
    category: "SFX",
    label: "SFX / agua",
    description: "Detalle de agua cercano para diseño sonoro, edición y capas de foley.",
    duration: "4:12",
    price: 2.9,
    preview: "/media/audio/SFX-001__AGUA_CORRIENDO_BAJO_SUELO_CORTO_PALACIO_2.mp3",
    tags: ["agua", "detalle"],
  },
  {
    id: "SFX-030",
    title: "Cuchillo · Afilado 01",
    category: "SFX",
    label: "SFX / cuchillo",
    description: "Metal y fricción para tensión física, ficción sonora y montaje cinematográfico.",
    duration: "2:46",
    price: 2.9,
    preview: "/media/audio/SFX-030__KS_Knife_Sharpen_1.mp3",
    tags: ["metal", "tensión"],
  },
  {
    id: "SFX-047",
    title: "Bestia · Voz 01",
    category: "SFX",
    label: "SFX / criaturas",
    description: "Una vocalización áspera para criaturas, monstruos y mundos imposibles.",
    duration: "2:59",
    price: 2.9,
    preview: "/media/audio/SFX-047__KS_Beast_1.mp3",
    tags: ["criatura", "voz"],
  },
];

const categories = ["Todos", "Ambientes", "SFX", "Música audiovisual", "Música contemporánea"] as const;

const projects = [
  { title: "Ritual", type: "Diseño sonoro / corto", video: "/media/portfolio/ritual.mp4", tone: "project-ritual" },
  { title: "OK Google", type: "Foley / audiovisual", video: "/media/portfolio/ok-google.mp4", tone: "project-google" },
  { title: "SFX LOL", type: "Creación de efectos", video: "/media/portfolio/sfx-lol.mp4", tone: "project-sfx" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function AudioPreview({ product }: { product: Product }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      return;
    }
    await audioRef.current.play();
  };

  return (
    <div className="preview-row">
      <button className="play-button" type="button" onClick={toggle} aria-label={`${isPlaying ? "Pausar" : "Reproducir"} preview de ${product.title}`}>
        {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      </button>
      <div className="waveform" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} style={{ height: `${12 + ((index * 17) % 23)}%` }} />
        ))}
      </div>
      <span className="preview-time">{product.duration}</span>
      <audio
        ref={audioRef}
        src={product.preview}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

function ProductCard({ product, selected, onToggle }: { product: Product; selected: boolean; onToggle: () => void }) {
  return (
    <article className="product-card">
      <div className="product-card-topline">
        <span>{product.id}</span>
        <span>{product.label}</span>
      </div>
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <div className="tag-row">
        {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <AudioPreview product={product} />
      <div className="product-card-footer">
        <strong>{formatPrice(product.price)}</strong>
        <button className={selected ? "selection-button selected" : "selection-button"} type="button" onClick={onToggle}>
          {selected ? <Check size={15} /> : <Plus size={15} />}
          {selected ? "En selección" : "Añadir"}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showSelection, setShowSelection] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return products.filter((product) => {
      const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
      const searchable = `${product.title} ${product.category} ${product.tags.join(" ")}`.toLocaleLowerCase("es");
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeCategory, query]);

  const toggleSelection = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SoundScape, volver arriba">
          <span className="brand-mark"><Headphones size={17} strokeWidth={1.8} /></span>
          <span>SoundScape</span>
        </a>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Navegación principal">
          <a href="#library" onClick={() => setMenuOpen(false)}>Biblioteca</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Servicios</a>
          <a href="#work" onClick={() => setMenuOpen(false)}>Proyectos</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Sobre SoundScape</a>
        </nav>
        <div className="header-actions">
          <button className="selection-trigger" type="button" onClick={() => setShowSelection(true)} aria-label={`Abrir selección, ${selected.length} elementos`}>
            <ShoppingBag size={17} />
            <span>Selección</span>
            {selected.length > 0 && <b>{selected.length}</b>}
          </button>
          <a className="header-contact" href="#contact">Hablemos <ArrowUpRight size={15} /></a>
          <button className="menu-trigger" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menú">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Biblioteca sonora independiente</p>
          <h1>El mundo también se compone de <em>ruido.</em></h1>
          <p className="hero-lede">Grabaciones de campo, efectos y música contemporánea para imágenes que todavía no existen.</p>
          <div className="hero-actions">
            <a className="button primary" href="#library">Explorar biblioteca <ArrowDownRight size={16} /></a>
            <a className="button secondary" href="#contact">Encargar un proyecto <ArrowUpRight size={16} /></a>
          </div>
          <div className="hero-meta">
            <span><b>102</b> piezas listas para escuchar</span>
            <span><i /> Previews estéreo normalizadas</span>
          </div>
        </div>
        <div className="hero-visual">
          <Image src="/media/brand/landscape.jpg" alt="Paisaje de montaña de SoundScape" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
          <div className="hero-image-overlay" />
          <div className="hero-signal">
            <div className="signal-label"><span className="signal-live" /> señal encontrada</div>
            <div className="signal-wave" aria-hidden="true">
              {Array.from({ length: 34 }, (_, index) => <span key={index} style={{ height: `${20 + ((index * 23) % 68)}%` }} />)}
            </div>
            <div className="signal-footer"><span>FIELD NOTE / 013</span><span>RÍO SEGURA</span></div>
          </div>
          <div className="hero-stamp">SOUND<br />SCAPE<br /><span>est. 2024</span></div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Principios de SoundScape">
        <span>Escuchar primero</span><i />
        <span>Grabar afuera</span><i />
        <span>Diseñar con intención</span><i />
        <span>Dejar espacio</span>
      </section>

      <section className="library-section section-shell" id="library">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / Biblioteca</p>
            <h2>Sonidos para entrar<br /><em>en la escena.</em></h2>
          </div>
          <p className="section-intro">Una selección inicial del archivo SoundScape. Escucha antes de elegir; cada pieza conserva su carácter y su espacio.</p>
        </div>
        <div className="library-toolbar">
          <div className="category-tabs" role="tablist" aria-label="Filtrar biblioteca">
            {categories.map((category) => (
              <button key={category} type="button" className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>
          <label className="search-field">
            <span>Buscar</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="lluvia, criatura, Murcia…" />
          </label>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} selected={selected.includes(product.id)} onToggle={() => toggleSelection(product.id)} />)}
        </div>
        {filteredProducts.length === 0 && <div className="empty-state">No hay piezas con ese filtro todavía.</div>}
        <div className="library-bottomline"><span>Mostrando {filteredProducts.length} de una primera selección del catálogo.</span><a href="#contact">¿Necesitas algo específico? <ArrowUpRight size={14} /></a></div>
      </section>

      <section className="free-section section-shell">
        <div className="free-card">
          <div className="free-number">02</div>
          <div className="free-copy">
            <p className="eyebrow">SoundScape Starter Pack</p>
            <h2>Un pequeño archivo<br /><em>para empezar.</em></h2>
            <p>Una colección gratuita de piezas de campo y efectos seleccionada para probar el sonido de SoundScape en tus propias imágenes.</p>
            <a className="text-link" href="#contact">Avísame cuando salga <ArrowUpRight size={15} /></a>
          </div>
          <div className="free-scope">
            <span className="scope-label">Próximo lanzamiento</span>
            <div className="scope-visual"><span>10–15</span><small>piezas<br />representativas</small></div>
            <div className="scope-lines"><i /><i /><i /><i /></div>
          </div>
        </div>
      </section>

      <section className="services-section section-shell" id="services">
        <div className="section-heading compact">
          <div><p className="eyebrow">03 / Servicios</p><h2>Cuando el proyecto<br /><em>necesita otra capa.</em></h2></div>
          <p className="section-intro">Diseño sonoro, producción musical y mezcla para cine, vídeo, videojuegos e instalaciones.</p>
        </div>
        <div className="service-grid">
          {["Diseño sonoro", "Producción musical", "Mezcla y postproducción"].map((service, index) => (
            <a href="#contact" className="service-card" key={service}>
              <span className="service-index">0{index + 1}</span>
              <h3>{service}</h3>
              <p>{["Foley, ambientes y efectos que sostienen la imagen sin competir con ella.", "Música original, texturas y piezas pensadas para la narrativa del proyecto.", "Un espacio claro para voces, imagen y todos los detalles que hacen creíble una escena."][index]}</p>
              <span className="service-arrow"><ArrowUpRight size={18} /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="work-section section-shell" id="work">
        <div className="section-heading compact">
          <div><p className="eyebrow">04 / Proyectos</p><h2>El sonido también<br /><em>cuenta historias.</em></h2></div>
          <a className="text-link" href="#contact">Trabajemos juntos <ArrowUpRight size={15} /></a>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className={`project-card ${project.tone}`} key={project.title}>
              <div className="project-media"><video controls preload="metadata" playsInline src={project.video} /></div>
              <div className="project-caption"><div><h3>{project.title}</h3><p>{project.type}</p></div><ArrowUpRight size={18} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section section-shell" id="about">
        <div className="about-mark"><Image src="/media/brand/icon-texture.png" alt="Icono SoundScape" width={520} height={520} /></div>
        <div className="about-copy"><p className="eyebrow">05 / Sobre SoundScape</p><h2>Un oído puesto<br />en el <em>paisaje.</em></h2><p>SoundScape nace de grabar lo que normalmente queda fuera de campo: la habitación antes de la acción, el metal, el agua, una voz lejana. Una biblioteca propia y un estudio abierto a proyectos que necesitan sonido con identidad.</p><a className="text-link" href="#contact">Conocer el proceso <ArrowUpRight size={15} /></a></div>
      </section>

      <section className="contact-section section-shell" id="contact">
        <div><p className="eyebrow">06 / Contacto</p><h2>Cuéntame qué<br /><em>estás escuchando.</em></h2></div>
        <div className="contact-panel"><p>Para licencias, encargos, colaboraciones o una pregunta concreta sobre el archivo:</p><a className="contact-email" href="mailto:hola@soundscape.audio">hola@soundscape.audio <ArrowUpRight size={18} /></a><div className="contact-rule" /><div className="contact-small"><span>Diseño sonoro / música / campo</span><span>Ecuador · España · remoto</span></div></div>
      </section>

      <footer className="site-footer"><a className="brand" href="#top"><span className="brand-mark"><Headphones size={17} strokeWidth={1.8} /></span><span>SoundScape</span></a><span>Biblioteca sonora independiente</span><span>© 2026 SoundScape</span></footer>

      {showSelection && <div className="selection-overlay" role="presentation" onClick={() => setShowSelection(false)}>
        <aside className="selection-panel" role="dialog" aria-modal="true" aria-labelledby="selection-title" onClick={(event) => event.stopPropagation()}>
          <div className="selection-head"><div><p className="eyebrow">Tu selección</p><h2 id="selection-title">Piezas para<br /><em>revisar.</em></h2></div><button type="button" onClick={() => setShowSelection(false)} aria-label="Cerrar selección"><X size={21} /></button></div>
          {selected.length === 0 ? <div className="selection-empty"><ShoppingBag size={22} /><p>Añade piezas de la biblioteca para preparar una consulta.</p><button className="button secondary" type="button" onClick={() => setShowSelection(false)}>Volver a escuchar</button></div> : <div className="selection-list">{selected.map((id) => { const product = products.find((item) => item.id === id); return product ? <div className="selection-item" key={id}><div><span>{product.category}</span><strong>{product.title}</strong></div><button type="button" onClick={() => toggleSelection(id)} aria-label={`Quitar ${product.title}`}><X size={15} /></button></div> : null; })}<a className="button primary full" href="#contact" onClick={() => setShowSelection(false)}>Solicitar esta selección <ArrowUpRight size={16} /></a></div>}
        </aside>
      </div>}
    </main>
  );
}
