"use client";

import { useEffect, useState, useRef, type CSSProperties } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { CanvasElement } from "@/types/canvas-element";

interface RichTextToolbarProps {
  selectedElement: CanvasElement | null;
  onUpdateStyle: (id: string, styles: CSSProperties) => void;
  deviceView?: "desktop" | "tablet" | "mobile";
}

const FONTS: { label: string; value: string }[] = [
  // Sans-serif
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
  { label: "Work Sans", value: "'Work Sans', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "Manrope", value: "Manrope, sans-serif" },
  { label: "Figtree", value: "Figtree, sans-serif" },
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Outfit", value: "Outfit, sans-serif" },
  { label: "Raleway", value: "Raleway, sans-serif" },
  { label: "Oswald", value: "Oswald, sans-serif" },
  { label: "Barlow", value: "Barlow, sans-serif" },
  { label: "Karla", value: "Karla, sans-serif" },
  { label: "Mulish", value: "Mulish, sans-serif" },
  { label: "Ubuntu", value: "Ubuntu, sans-serif" },
  { label: "Josefin Sans", value: "'Josefin Sans', sans-serif" },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  // Serif
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Lora", value: "Lora, serif" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
  { label: "EB Garamond", value: "'EB Garamond', serif" },
  { label: "Libre Baskerville", value: "'Libre Baskerville', serif" },
  { label: "Cinzel", value: "Cinzel, serif" },
  { label: "PT Serif", value: "'PT Serif', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  // Display
  { label: "Pacifico", value: "Pacifico, cursive" },
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Lobster", value: "Lobster, cursive" },
  { label: "Caveat", value: "Caveat, cursive" },
  { label: "Comfortaa", value: "Comfortaa, cursive" },
  { label: "Abril Fatface", value: "'Abril Fatface', cursive" },
  { label: "Righteous", value: "Righteous, cursive" },
  // Mono
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Fira Code", value: "'Fira Code', monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', monospace" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];


const TEXT_TYPES = new Set(["Heading1", "Heading2", "Heading3", "Paragraph", "Button"]);

const BTN = ({
  children, title, active, onClick,
}: {
  children: React.ReactNode; title: string; active?: boolean; onClick: () => void;
}) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    style={{
      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 6, border: "none", cursor: "pointer", flexShrink: 0,
      background: active ? "rgba(99,139,255,0.25)" : "transparent",
      color: active ? "#7ba0ff" : "rgba(220,225,255,0.75)",
      transition: "background 0.12s",
    }}
  >{children}</button>
);

const SEP = () => (
  <div style={{ width: 1, height: 16, background: "rgba(99,139,255,0.2)", margin: "0 3px", flexShrink: 0 }} />
);

export default function RichTextToolbar({ selectedElement, onUpdateStyle, deviceView }: RichTextToolbarProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Position toolbar above the selected element
  useEffect(() => {
    if (!selectedElement || !TEXT_TYPES.has(selectedElement.type)) {
      setPos(null);
      return;
    }
    const dom = document.querySelector(`[data-element-id="${selectedElement.id}"]`);
    if (!dom) { setPos(null); return; }
    const rect = dom.getBoundingClientRect();
    const TOOLBAR_W = 500;
    let top = rect.top - 50;
    if (top < 6) top = rect.bottom + 6;
    let left = rect.left + rect.width / 2;
    left = Math.max(TOOLBAR_W / 2 + 6, Math.min(window.innerWidth - TOOLBAR_W / 2 - 6, left));
    setPos({ top, left });
  }, [selectedElement]);

  if (!pos || !selectedElement || !TEXT_TYPES.has(selectedElement.type)) return null;

  // Get current effective styles
  const responsive = deviceView === "tablet" ? selectedElement.responsiveStyles?.tablet
    : deviceView === "mobile" ? selectedElement.responsiveStyles?.mobile : undefined;
  const s: CSSProperties = { ...selectedElement.styles, ...responsive };

  const update = (patch: CSSProperties) => {
    onUpdateStyle(selectedElement.id, { ...s, ...patch });
  };

  const isBold      = String(s.fontWeight || "").includes("bold") || Number(s.fontWeight) >= 700;
  const isItalic    = s.fontStyle === "italic";
  const isUnderline = String(s.textDecoration || "").includes("underline");

  const currentFontLabel = String(s.fontFamily || "Inter").replace(/['"]/g, "").split(",")[0].trim();
  const currentFontEntry = FONTS.find(f => f.label === currentFontLabel) ?? FONTS[0];
  const currentSize = s.fontSize ? String(s.fontSize).replace("px", "") : "16";
  const currentColor = String(s.color || "#ffffff");
  const currentAlign = String(s.textAlign || "left");

  const inputBase: CSSProperties = {
    background: "rgba(15,22,48,0.7)", border: "1px solid rgba(99,139,255,0.2)",
    borderRadius: 6, color: "#e8eaf6", fontSize: 11, outline: "none",
    height: 26, boxSizing: "border-box",
  };

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)",
        zIndex: 9999,
        background: "rgba(7,10,22,0.97)",
        border: "1px solid rgba(99,139,255,0.28)",
        borderRadius: 12, padding: "5px 8px",
        display: "flex", alignItems: "center", gap: 3,
        boxShadow: "0 6px 28px rgba(0,0,0,0.7)",
        backdropFilter: "blur(14px)",
        userSelect: "none",
        animation: "pmi-fadeInDown 0.12s ease both",
        whiteSpace: "nowrap",
      }}
    >
      {/* Font family */}
      <select
        value={currentFontEntry.value}
        onChange={e => update({ fontFamily: e.target.value })}
        onMouseDown={e => e.stopPropagation()}
        style={{ ...inputBase, padding: "0 4px", width: 110, cursor: "pointer" }}
        title="Шрифт"
      >
        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      {/* Font size */}
      <select
        value={currentSize}
        onChange={e => update({ fontSize: `${e.target.value}px` })}
        onMouseDown={e => e.stopPropagation()}
        style={{ ...inputBase, padding: "0 4px", width: 58, cursor: "pointer" }}
        title="Размер (px)"
      >
        {[8,9,10,11,12,13,14,16,18,20,22,24,26,28,32,36,40,44,48,52,56,60,64,72,80,90,96,104,120,144].map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Text color */}
      <label title="Цвет текста" style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(99,139,255,0.2)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          <span style={{ fontSize: 12, color: "rgba(220,225,255,0.75)", lineHeight: 1 }}>A</span>
          <div style={{ width: 16, height: 3, borderRadius: 2, background: currentColor }} />
        </div>
        <input
          type="color" value={currentColor.startsWith("#") ? currentColor : "#ffffff"}
          onChange={e => update({ color: e.target.value })}
          onMouseDown={e => e.stopPropagation()}
          style={{ position: "absolute", opacity: 0, width: 1, height: 1, top: 0, left: 0 }}
        />
      </label>

      <SEP />

      {/* B I U */}
      <BTN title="Жирный" active={isBold}
        onClick={() => update({ fontWeight: isBold ? "normal" : "bold" })}>
        <Bold size={12}/>
      </BTN>
      <BTN title="Курсив" active={isItalic}
        onClick={() => update({ fontStyle: isItalic ? "normal" : "italic" })}>
        <Italic size={12}/>
      </BTN>
      <BTN title="Подчёркивание" active={isUnderline}
        onClick={() => update({ textDecoration: isUnderline ? "none" : "underline" })}>
        <Underline size={12}/>
      </BTN>

      <SEP />

      {/* Alignment */}
      <BTN title="По левому краю" active={currentAlign === "left" || currentAlign === "start"}
        onClick={() => update({ textAlign: "left" })}><AlignLeft size={12}/></BTN>
      <BTN title="По центру" active={currentAlign === "center"}
        onClick={() => update({ textAlign: "center" })}><AlignCenter size={12}/></BTN>
      <BTN title="По правому краю" active={currentAlign === "right"}
        onClick={() => update({ textAlign: "right" })}><AlignRight size={12}/></BTN>
    </div>
  );
}
