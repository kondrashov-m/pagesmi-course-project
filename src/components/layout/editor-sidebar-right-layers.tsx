"use client";

import type { CanvasElement } from "@/types/canvas-element";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

const TYPE_ICONS: Record<string, string> = {
  Header: "▤", Footer: "▥", Container: "▢",
  Heading1: "H1", Heading2: "H2", Heading3: "H3",
  Paragraph: "¶", Button: "⬡", Image: "🖼",
};

const TYPE_LABELS: Record<string, string> = {
  Header: "Шапка", Footer: "Подвал", Container: "Контейнер",
  Heading1: "Заголовок 1", Heading2: "Заголовок 2", Heading3: "Заголовок 3",
  Paragraph: "Параграф", Button: "Кнопка", Image: "Изображение",
};

function LayerItem({
  el, depth, selectedId, onSelect,
}: {
  el: CanvasElement;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const hasChildren = !!(el.children && el.children.length > 0);
  const [open, setOpen] = useState(true);
  const isSelected = selectedId === el.id;

  const label = el.content
    ? String(el.content).replace(/<[^>]+>/g, "").slice(0, 22) || TYPE_LABELS[el.type] || el.type
    : TYPE_LABELS[el.type] || el.type;

  return (
    <div>
      <div
        onClick={() => onSelect(el.id)}
        style={{
          display: "flex", alignItems: "center",
          paddingLeft: 8 + depth * 14,
          paddingRight: 8,
          paddingTop: 4, paddingBottom: 4,
          borderRadius: 6,
          cursor: "pointer",
          background: isSelected ? "rgba(99,139,255,0.18)" : "transparent",
          border: isSelected ? "1px solid rgba(99,139,255,0.35)" : "1px solid transparent",
          marginBottom: 2,
          transition: "all 0.12s",
          gap: 5,
        }}
        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(99,139,255,0.07)"; }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      >
        {/* Expand toggle */}
        <span
          onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
          style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: hasChildren ? 1 : 0 }}
        >
          {hasChildren
            ? open
              ? <ChevronDown size={11} style={{ color: "rgba(232,234,246,0.5)" }} />
              : <ChevronRight size={11} style={{ color: "rgba(232,234,246,0.5)" }} />
            : null}
        </span>

        {/* Type badge */}
        <span style={{
          fontSize: 9, fontWeight: 700, flexShrink: 0,
          padding: "1px 5px", borderRadius: 4,
          background: isSelected ? "rgba(99,139,255,0.3)" : "rgba(99,139,255,0.1)",
          color: isSelected ? "#638bff" : "rgba(99,139,255,0.7)",
          minWidth: 20, textAlign: "center",
        }}>
          {TYPE_ICONS[el.type] || "?"}
        </span>

        {/* Label */}
        <span style={{
          fontSize: 12, color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          flex: 1,
        }}>
          {label}
        </span>
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div>
          {el.children!.map(child => (
            <LayerItem key={child.id} el={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditorSidebarRightLayers({
  elements,
  selectedId,
  onSelect,
}: {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="glass-scroll h-full overflow-y-auto" style={{ padding: "8px 6px" }}>
      {elements.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", padding: "24px 8px" }}>
          Добавьте элементы на страницу
        </p>
      ) : (
        elements.map(el => (
          <LayerItem key={el.id} el={el} depth={0} selectedId={selectedId} onSelect={onSelect} />
        ))
      )}
    </div>
  );
}
