import waveformData from "../public/media/waveforms.json";

const publicMediaBaseUrl = "https://pub-4fce4eeaecdd440a8fabdc162b2b2b0b.r2.dev";

export type Category = "Ambientes" | "Música audiovisual" | "Música contemporánea" | "SFX";

export type Product = {
  id: string;
  title: string;
  category: Category;
  label: string;
  description: string;
  duration: string;
  price: number;
  preview: string;
  tags: string[];
  axis: { x: number; y: number };
  accent: "water" | "air" | "dark" | "metal" | "organic" | "cinema";
};

export type WaveformData = { duration: number; peaks: number[] };

export const categories = ["Todos", "Ambientes", "SFX", "Música audiovisual", "Música contemporánea"] as const;
export const feelingTags = ["agua", "atmósfera", "campo", "oscuro", "ceremonial", "tensión", "criatura", "metal"];

export const waveformByPath = waveformData as Record<string, WaveformData>;

const curatedProducts: Product[] = [
  {
    id: "AMB-001",
    title: "Alcantarilla · Ambiente",
    category: "Ambientes",
    label: "Campo / textura",
    description: "Una textura subterránea, húmeda y cercana para construir espacio.",
    duration: "1:04",
    price: 6.9,
    preview: "/media/previews/AMB-001__ALCANTARILLA.mp3",
    tags: ["campo", "agua"],
    axis: { x: 24, y: 28 },
    accent: "water",
  },
  {
    id: "AMB-005",
    title: "Lluvia · Ambiente",
    category: "Ambientes",
    label: "Atmósfera",
    description: "Lluvia continua y abierta para capas, transiciones y escenas suspendidas.",
    duration: "1:53",
    price: 6.9,
    preview: "/media/previews/AMB-005__AMBIENTE_LLUVIA.mp3",
    tags: ["lluvia", "atmósfera"],
    axis: { x: 38, y: 22 },
    accent: "air",
  },
  {
    id: "AMB-013",
    title: "Río Segura · Ambiente de campo",
    category: "Ambientes",
    label: "Murcia / 3 canales",
    description: "Grabación de campo de larga duración con perspectiva amplia y orgánica.",
    duration: "2:55",
    price: 9.9,
    preview: "/media/previews/AMB-013__MURCIA_RIO_SEGURA.mp3",
    tags: ["Murcia", "río", "3ch"],
    axis: { x: 18, y: 48 },
    accent: "water",
  },
  {
    id: "MAV-005",
    title: "Impacto",
    category: "Música audiovisual",
    label: "Música / FX",
    description: "Un gesto de tensión breve para marcar un corte, una entrada o una revelación.",
    duration: "2:20",
    price: 14.9,
    preview: "/media/previews/MAV-005__MUSICA_FX_IMPACTO.mp3",
    tags: ["impacto", "cine"],
    axis: { x: 74, y: 67 },
    accent: "cinema",
  },
  {
    id: "MUS-004",
    title: "Luxury · MMIX 1",
    category: "Música contemporánea",
    label: "Pista completa",
    description: "La versión principal seleccionada para presentar el universo contemporáneo de SoundScape.",
    duration: "4:52",
    price: 24.9,
    preview: "/media/previews/MUS-004__LUXURY_MMIX_1.mp3",
    tags: ["contemporánea", "master"],
    axis: { x: 62, y: 38 },
    accent: "cinema",
  },
  {
    id: "MUS-009",
    title: "Satanic Church",
    category: "Música contemporánea",
    label: "Pista completa",
    description: "Una pieza oscura y ceremonial para imagen, instalación y narrativas de alta tensión.",
    duration: "4:18",
    price: 19.9,
    preview: "/media/previews/MUS-009__SATANIC_CHURCH.mp3",
    tags: ["oscuro", "ceremonial"],
    axis: { x: 78, y: 35 },
    accent: "dark",
  },
  {
    id: "SFX-001",
    title: "Agua bajo suelo · Palacio 01",
    category: "SFX",
    label: "SFX / agua",
    description: "Detalle de agua cercano para diseño sonoro, edición y capas de foley.",
    duration: "4:12",
    price: 2.9,
    preview: "/media/previews/SFX-001__AGUA_CORRIENDO_BAJO_SUELO_CORTO_PALACIO_2.mp3",
    tags: ["agua", "detalle"],
    axis: { x: 31, y: 69 },
    accent: "water",
  },
  {
    id: "SFX-030",
    title: "Cuchillo · Afilado 01",
    category: "SFX",
    label: "SFX / cuchillo",
    description: "Metal y fricción para tensión física, ficción sonora y montaje cinematográfico.",
    duration: "2:46",
    price: 2.9,
    preview: "/media/previews/SFX-030__KS_Knife_Sharpen_1.mp3",
    tags: ["metal", "tensión"],
    axis: { x: 83, y: 73 },
    accent: "metal",
  },
  {
    id: "SFX-047",
    title: "Bestia · Voz 01",
    category: "SFX",
    label: "SFX / criaturas",
    description: "Una vocalización áspera para criaturas, monstruos y mundos imposibles.",
    duration: "2:59",
    price: 2.9,
    preview: "/media/previews/SFX-047__KS_Beast_1.mp3",
    tags: ["criatura", "voz"],
    axis: { x: 66, y: 86 },
    accent: "organic",
  },
];

const categoryByPrefix: Record<string, Category> = {
  AMB: "Ambientes",
  MAV: "Música audiovisual",
  MUS: "Música contemporánea",
  SFX: "SFX",
};

const categoryMeta: Record<Category, { accent: Product["accent"]; label: string; price: number; tag: string }> = {
  Ambientes: { accent: "air", label: "Campo / textura", price: 6.9, tag: "ambiente" },
  SFX: { accent: "metal", label: "SFX / textura", price: 2.9, tag: "efecto" },
  "Música audiovisual": { accent: "cinema", label: "Música / imagen", price: 14.9, tag: "imagen" },
  "Música contemporánea": { accent: "dark", label: "Música / pista", price: 19.9, tag: "música" },
};

const uppercaseTokens = new Set(["ak47", "eq", "fx", "ia", "ks", "mmix", "pn"]);

function humanizeTitle(rawTitle: string) {
  return rawTitle
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => uppercaseTokens.has(word) ? word.toUpperCase() : `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.round(seconds));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function generatedProduct(path: string, index: number): Product {
  const fileName = path.split("/").pop() ?? path;
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const separatorIndex = baseName.indexOf("__");
  const id = separatorIndex >= 0 ? baseName.slice(0, separatorIndex) : baseName;
  const rawTitle = separatorIndex >= 0 ? baseName.slice(separatorIndex + 2) : baseName;
  const prefix = id.slice(0, 3);
  const category = categoryByPrefix[prefix] ?? "SFX";
  const meta = categoryMeta[category];
  const waveform = waveformByPath[path];
  const tags = Array.from(new Set([
    meta.tag,
    ...rawTitle.toLowerCase().split(/[_\s]+/).filter((token) => token.length > 2 && !/^\d+$/.test(token)),
  ])).slice(0, 5);

  return {
    id,
    title: humanizeTitle(rawTitle),
    category,
    label: meta.label,
    description: `Pieza propia de ${meta.label.toLowerCase()} para escucha, montaje y diseño sonoro.`,
    duration: formatDuration(waveform?.duration ?? 0),
    price: meta.price,
    preview: path.replace("/media/audio/", "/media/previews/"),
    tags,
    axis: { x: 12 + ((index * 37) % 76), y: 18 + ((index * 53) % 70) },
    accent: meta.accent,
  };
}

const curatedById = new Map(curatedProducts.map((product) => [product.id, product]));

export const products: Product[] = Object.keys(waveformByPath).map((path, index) => {
  const fileName = path.split("/").pop() ?? path;
  const id = fileName.split("__")[0];
  return curatedById.get(id) ?? generatedProduct(path, index);
});

export const projects = [
  {
    number: "01",
    title: "OK Google",
    type: "Foley / audiovisual",
    video: "/media/portfolio/ok-google.mp4",
    poster: "/media/portfolio/posters/ok-google.webp",
  },
  {
    number: "02",
    title: "El Banco",
    type: "Diseño sonoro / audiovisual",
    video: `${publicMediaBaseUrl}/el-banco-final.mp4`,
    poster: "/media/portfolio/posters/el-banco-final.webp",
  },
  {
    number: "03",
    title: "Ritual",
    type: "Diseño sonoro / corto",
    video: "/media/portfolio/ritual.mp4",
    poster: "/media/portfolio/posters/ritual.webp",
  },
  {
    number: "04",
    title: "SFX LOL",
    type: "Creación de efectos",
    video: "/media/portfolio/sfx-lol.mp4",
    poster: "/media/portfolio/posters/sfx-lol.webp",
  },
];

export const audioCount = products.length;

export function waveformFor(path: string) {
  const sourcePath = path.replace("/media/previews/", "/media/audio/");
  return waveformByPath[path] ?? waveformByPath[sourcePath] ?? { duration: 0, peaks: Array.from({ length: 72 }, (_, index) => 0.1 + ((index * 19) % 38) / 100) };
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}
