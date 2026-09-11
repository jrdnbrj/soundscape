"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Play, X } from "lucide-react";
import { useAudio } from "./audio/audio-context";
import { localizedProduct, translations, type Language } from "../lib/i18n";
import { products, type Product } from "../lib/catalogue";

type SessionPanelProps = {
  selected: string[];
  onClose: () => void;
  onRemove: (id: string) => void;
  language: Language;
};

export function SessionPanel({ selected, onClose, onRemove, language }: SessionPanelProps) {
  const { playTrack } = useAudio();
  const copy = translations[language];
  const selectedProducts = selected.map((id) => products.find((item) => item.id === id)).filter((product): product is Product => Boolean(product));
  const message = `${copy.selectionMessage}${selectedProducts.map((product) => `• ${localizedProduct(product, language).title}`).join("\n")}\n\n${copy.messageClose}`;
  const whatsappHref = `https://wa.me/346327333266?text=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      <motion.div className="session-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.aside className="session-panel" role="dialog" aria-modal="true" aria-labelledby="session-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }} onClick={(event) => event.stopPropagation()}>
          <div className="session-header"><div><p className="section-label">{copy.sessionLabel} · {selected.length}</p><h2 id="session-title">{copy.sessionTitle}<br /><em>{copy.sessionTitleAccent}</em></h2></div><button className="icon-button" type="button" onClick={onClose} aria-label={copy.selection}><X size={19} /></button></div>
          {selected.length === 0 ? <div className="session-empty"><p>{copy.sessionEmpty}</p><button className="line-button" type="button" onClick={onClose}>{copy.backToArchive} <ArrowUpRight size={15} /></button></div> : (
            <div className="session-track-list">
              {selected.map((id) => {
                const product = products.find((item) => item.id === id);
                if (!product) return null;
                const display = localizedProduct(product, language);
                return <div className="session-track" key={id}><button className="session-track-play" type="button" onClick={() => void playTrack(product)} aria-label={`${copy.play} ${display.title}`}><Play size={13} fill="currentColor" /></button><div className="session-track-main"><strong>{display.title}</strong><span>{display.categoryLabel} · {product.duration}</span></div><button className="session-track-remove" type="button" onClick={() => onRemove(id)} aria-label={`${copy.remove} ${display.title}`}><X size={14} /></button></div>;
              })}
              <a className="session-cta" href={whatsappHref} target="_blank" rel="noreferrer" onClick={onClose}>{copy.askWhatsApp} <ArrowUpRight size={16} /></a>
            </div>
          )}
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}
