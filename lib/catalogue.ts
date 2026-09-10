import waveformData from "../public/media/waveforms.json";

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

export const products: Product[] = [
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
    preview: "/media/audio/AMB-005__AMBIENTE_LLUVIA.mp3",
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
    preview: "/media/audio/AMB-013__MURCIA_RIO_SEGURA.mp3",
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
    preview: "/media/audio/MAV-005__MUSICA_FX_IMPACTO.mp3",
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
    preview: "/media/audio/MUS-004__LUXURY_MMIX_1.mp3",
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
    preview: "/media/audio/MUS-009__SATANIC_CHURCH.mp3",
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
    preview: "/media/audio/SFX-001__AGUA_CORRIENDO_BAJO_SUELO_CORTO_PALACIO_2.mp3",
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
    preview: "/media/audio/SFX-030__KS_Knife_Sharpen_1.mp3",
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
    preview: "/media/audio/SFX-047__KS_Beast_1.mp3",
    tags: ["criatura", "voz"],
    axis: { x: 66, y: 86 },
    accent: "organic",
  },
];

export const projects = [
  {
    number: "01",
    title: "Ritual",
    type: "Diseño sonoro / corto",
    video: "/media/portfolio/ritual.mp4",
    poster: "/media/portfolio/posters/ritual.jpg",
  },
  {
    number: "02",
    title: "OK Google",
    type: "Foley / audiovisual",
    video: "/media/portfolio/ok-google.mp4",
    poster: "/media/portfolio/posters/ok-google.jpg",
  },
  {
    number: "03",
    title: "SFX LOL",
    type: "Creación de efectos",
    video: "/media/portfolio/sfx-lol.mp4",
    poster: "/media/portfolio/posters/sfx-lol.jpg",
  },
];

export const waveformByPath = waveformData as Record<string, WaveformData>;
export const audioCount = Object.keys(waveformByPath).length;

export function waveformFor(path: string) {
  return waveformByPath[path] ?? { duration: 0, peaks: Array.from({ length: 72 }, (_, index) => 0.1 + ((index * 19) % 38) / 100) };
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}
