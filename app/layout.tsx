import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoundScape — Biblioteca sonora independiente",
  description:
    "Grabaciones de campo, efectos y música contemporánea para cine, vídeo, videojuegos e instalaciones.",
  keywords: [
    "SoundScape",
    "diseño sonoro",
    "grabaciones de campo",
    "SFX",
    "música audiovisual",
  ],
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
