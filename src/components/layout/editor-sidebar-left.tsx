
"use client";

import {
  Heading1 as Heading1Icon,
  Type as TypeIcon,
  Image as ImageIcon,
  SquareDashedMousePointer as SquareDashedMousePointerIcon,
  RectangleHorizontal as RectangleHorizontalIcon,
  GripVertical,
  PanelTop,
  PanelBottom,
  Columns,
  LayoutDashboard as CanvasIcon,
  BookmarkCheck,
  Trash2,
  PencilRuler,
  LayoutTemplate,
  type LucideIcon,
} from "lucide-react";
import type { ElementType, SitePage, CanvasElement, SavedBlock } from "@/types/canvas-element";
import type { CSSProperties } from "react";
import CanvasPropertyPanel from "@/components/canvas-property-panel";
import { TEMPLATES } from "@/lib/page-templates";
import { HEADER_PRESETS } from "@/lib/header-footer-presets";

export type ActiveLeftTab = "elements" | "templates" | "canvas" | "header";

/* ─── Preset blocks ─────────────────────────────────────────────── */
const PRESET_BLOCKS = [
  { id: "cta", label: "Стандартный блок", gradient: "from-blue-500 to-purple-600" },
  { id: "features", label: "Три колонки", gradient: "from-teal-500 to-blue-500" },
  { id: "pricing", label: "Три колонки с кнопками", gradient: "from-purple-500 to-pink-500" },
  { id: "team", label: "Три колонки с логотипами", gradient: "from-orange-400 to-red-500" },
] as const;

/* ─── Elements list ──────────────────────────────────────────────── */
interface ElementEntry {
  type: ElementType;
  label: string;
  Icon: LucideIcon;
}

const ELEMENTS: ElementEntry[] = [
  { type: "Heading1", label: "Заголовок", Icon: Heading1Icon },
  { type: "Paragraph", label: "Текстовый блок", Icon: TypeIcon },
  { type: "Image", label: "Изображение", Icon: ImageIcon },
  { type: "Button", label: "Кнопка", Icon: SquareDashedMousePointerIcon },
  { type: "Container", label: "Контейнер (простой)", Icon: RectangleHorizontalIcon },
  { type: "Container", label: "Контейнер (2 блока)", Icon: Columns },
  { type: "Container", label: "Контейнер (3 блока)", Icon: Columns },
];

const CONTAINER_LAYOUT: Record<number, "simple" | "two-blocks" | "three-blocks"> = {
  4: "simple",
  5: "two-blocks",
  6: "three-blocks",
};

/* ─── Props interface ────────────────────────────────────────────── */
interface EditorSidebarLeftProps {
  isMobile?: boolean;
  onAddElement: (
    type: ElementType,
    attributes?: Partial<Pick<CanvasElement, "src" | "alt" | "props">>
  ) => void;
  onAddImage: () => void;
  activeTab: ActiveLeftTab;
  onTabChange: (tab: ActiveLeftTab) => void;
  canvasStyles: CSSProperties;
  onUpdateCanvasStyles: (newStyles: Partial<CSSProperties>) => void;
  gridSettings: SitePage["gridSettings"];
  onUpdateGridSettings: (show: boolean, size?: string) => void;
  activePageElements: CanvasElement[];
  onAddPresetBlock?: (blockId: string) => void;
  onApplyTemplate?: (templateId: string) => void;
  savedBlocks?: SavedBlock[];
  onInstantiateBlock?: (block: SavedBlock) => void;
  onRemoveSavedBlock?: (id: string) => void;
  activeTool?: ElementType | null;
  onSetActiveTool?: (tool: ElementType | null) => void;
  // Header editing
  onApplyHeaderStyle?: (styleId: string) => void;
  onToggleHeaderFreeform?: () => void;
  onUpdateHeaderBg?: (color: string) => void;
}

export default function EditorSidebarLeft({
  isMobile = false,
  onAddElement,
  onAddImage,
  activeTab,
  onTabChange,
  canvasStyles,
  onUpdateCanvasStyles,
  gridSettings,
  onUpdateGridSettings,
  activePageElements,
  onAddPresetBlock,
  onApplyTemplate,
  savedBlocks = [],
  onInstantiateBlock,
  onRemoveSavedBlock,
  activeTool,
  onSetActiveTool,
  onApplyHeaderStyle,
  onToggleHeaderFreeform,
  onUpdateHeaderBg,
}: EditorSidebarLeftProps) {
  const hasHeader = activePageElements.some((el) => el.type === "Header");
  const hasFooter = activePageElements.some((el) => el.type === "Footer");
  const headerEl = activePageElements.find((el) => el.type === "Header");
  const isFreeform = !!headerEl?.props?.freeform;
  const headerBg = (headerEl?.styles?.backgroundColor as string) || "#080c14";

  const handleElementClick = (entry: ElementEntry, index: number) => {
    if (entry.type === "Header" && hasHeader) return;
    if (entry.type === "Footer" && hasFooter) return;

    if (entry.type === "Header" || entry.type === "Footer") {
      onAddElement(entry.type);
      return;
    }
    if (entry.type === "Image") {
      onAddImage();
      return;
    }
    if (entry.type === "Container" && index !== 4) {
      const layoutType = CONTAINER_LAYOUT[index];
      onAddElement("Container", layoutType ? { props: { "data-layout-type": layoutType } } : undefined);
      return;
    }

    if (onSetActiveTool) {
      const toolType = entry.type === "Container" ? "Container" : entry.type;
      onSetActiveTool(activeTool === toolType ? null : toolType);
    } else {
      if (entry.type === "Container") {
        onAddElement("Container");
      } else {
        onAddElement(entry.type);
      }
    }
  };

  const sidebarStyle: CSSProperties = isMobile
    ? { width: "100%", height: "100%" }
    : { width: "var(--sidebar-l)", flexShrink: 0 };

return (
    <aside
      className={`glass-sidebar flex flex-col h-full ${isMobile ? "" : "rounded-r-2xl"}`}
      style={sidebarStyle}
    >
      {/* Vertical tabs */}
      <div className="flex flex-col gap-2 p-3 shrink-0 relative z-10">
        <button
          onClick={() => onTabChange("elements")}
          className={`glass-pill w-full py-2 text-sm font-semibold rounded-xl text-center transition-all duration-200 ${
            activeTab === "elements" 
              ? "active text-white" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Блоки
        </button>

        <button
          onClick={() => onTabChange("templates")}
          className={`glass-pill w-full py-2 text-sm font-semibold rounded-xl text-center transition-all duration-200 ${
            activeTab === "templates" 
              ? "active text-white" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <LayoutTemplate className="inline h-3.5 w-3.5 mr-1.5 mb-0.5" />
          Шаблоны
        </button>

        <button
          onClick={() => onTabChange("canvas")}
          className={`glass-pill w-full py-2 text-sm font-semibold rounded-xl text-center transition-all duration-200 ${
            activeTab === "canvas" 
              ? "active text-white" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <CanvasIcon className="inline h-3.5 w-3.5 mr-1.5 mb-0.5" />
          Холст
        </button>

        {hasHeader && (
          <button
            onClick={() => onTabChange("header")}
            className={`glass-pill w-full py-2 text-sm font-semibold rounded-xl text-center transition-all duration-200 ${
              activeTab === "header" 
                ? "active text-white" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <PanelTop className="inline h-3.5 w-3.5 mr-1.5 mb-0.5" />
            Шапка
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto glass-scroll px-3 pb-3 relative z-10">

        {/* ─── Блоки ─── */}
        {activeTab === "elements" && (
          <>
            <p className="section-label mb-2 mt-1">Готовые блоки</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PRESET_BLOCKS.map((block) => (
                <button
                  key={block.id}
                  onClick={() => onAddPresetBlock?.(block.id)}
                  className="glass-card rounded-xl p-0 overflow-hidden text-left"
                  title={block.label}
                >
                  <div className={`h-14 bg-gradient-to-br ${block.gradient} flex items-center justify-center`}>
                    <div className="flex flex-col items-center gap-1 opacity-70">
                      <div className="h-1.5 w-8 bg-white/70 rounded-full" />
                      <div className="h-1 w-6 bg-white/50 rounded-full" />
                      <div className="h-1 w-4 bg-white/40 rounded-full" />
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] p-1.5 text-center truncate">{block.label}</p>
                </button>
              ))}
            </div>

            <p className="section-label mb-2">Элементы</p>
            <div className="flex flex-col gap-1">
              {ELEMENTS.map((el, index) => {
                const isDisabled =
                  (el.type === "Header" && hasHeader) ||
                  (el.type === "Footer" && hasFooter);
                return (
                  <button
                    key={`${el.type}-${index}`}
                    onClick={() => handleElementClick(el, index)}
                    disabled={isDisabled}
                    className={`glass-card rounded-xl flex items-center gap-2.5 px-3 py-2.5 w-full text-left transition-all duration-200 ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : activeTool === el.type && index === (el.type === "Container" ? 4 : index)
                        ? "ring-2 ring-[#638bff] cursor-crosshair"
                        : "cursor-pointer"
                    }`}
                  >
                    <el.Icon className={`h-4 w-4 shrink-0 ${activeTool === el.type ? "text-[#638bff]" : "text-blue-400"}`} />
                    <span className="text-xs text-[var(--text-primary)] flex-1">{el.label}</span>
                    {activeTool === el.type
                      ? <span className="text-[9px] text-[#638bff] shrink-0">рисуй</span>
                      : <GripVertical className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                    }
                  </button>
                );
              })}
            </div>

            {savedBlocks.length > 0 && (
              <>
                <p className="section-label mb-2 mt-4">Мои блоки</p>
                <div className="flex flex-col gap-1">
                  {savedBlocks.map((block) => (
                    <div key={block.id} className="glass-card rounded-xl flex items-center gap-2.5 px-3 py-2.5">
                      <BookmarkCheck className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{block.name}</span>
                      <button onClick={() => onInstantiateBlock?.(block)} className="text-[10px] text-blue-400 hover:text-blue-300 shrink-0 px-1" title="Добавить на холст">+</button>
                      <button onClick={() => onRemoveSavedBlock?.(block.id)} className="text-[var(--text-muted)] hover:text-red-400 shrink-0"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ─── Шаблоны ─── */}
        {activeTab === "templates" && (
          <>
            <p className="section-label mb-2 mt-1">Шаблоны страниц</p>
            <div className="flex flex-col gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => onApplyTemplate?.(t.id)} className="glass-card rounded-xl overflow-hidden text-left w-full">
                  <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}>
                    <div className="absolute inset-0 flex flex-col px-3 py-2 gap-1 justify-center">
                      <div className="h-1 w-8 bg-white/60 rounded-full" />
                      <div className="h-2.5 w-20 bg-white/80 rounded mt-0.5" />
                      <div className="h-1 w-16 bg-white/50 rounded" />
                      <div className="flex gap-1 mt-1">
                        <div className="h-1.5 w-8 bg-white/70 rounded-full" />
                        <div className="h-1.5 w-6 bg-white/40 rounded-full" />
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        <div className="h-4 flex-1 bg-white/15 rounded" />
                        <div className="h-4 flex-1 bg-white/15 rounded" />
                        <div className="h-4 flex-1 bg-white/15 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ─── Холст ─── */}
        {activeTab === "canvas" && (
          <div className="mt-1">
            <CanvasPropertyPanel
              canvasStyles={canvasStyles}
              onUpdateCanvasStyles={onUpdateCanvasStyles}
              gridSettings={gridSettings}
              onUpdateGridSettings={onUpdateGridSettings}
            />
          </div>
        )}

        {/* ─── Шапка ─── */}
        {activeTab === "header" && (
          <div className="mt-1">
            {!headerEl ? (
              <p className="text-xs text-[var(--text-muted)] mt-6 text-center">Шапка не добавлена на холст</p>
            ) : isFreeform ? (
              /* Freeform mode */
              <>
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#638bff] animate-pulse" />
                  <span className="text-xs text-[#638bff] font-semibold">Свободный режим</span>
                </div>

                <button
                  onClick={onToggleHeaderFreeform}
                  className="glass-card rounded-xl w-full px-3 py-2.5 mb-3 text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2"
                >
                  <LayoutTemplate className="h-4 w-4 shrink-0 text-blue-400" />
                  Вернуться к пресетам
                </button>

                <p className="section-label mb-2">Цвет фона шапки</p>
                <div className="glass-card rounded-xl px-3 py-2.5 flex items-center gap-3">
                  <input
                    type="color"
                    value={headerBg.startsWith("#") ? headerBg : "#080c14"}
                    onChange={e => onUpdateHeaderBg?.(e.target.value)}
                    style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", padding: 0, background: "none" }}
                  />
                  <span className="text-xs text-[var(--text-secondary)] font-mono">{headerBg}</span>
                </div>

                <div className="mt-4 glass-card rounded-xl px-3 py-3">
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Выберите элемент из вкладки <span className="text-[#638bff]">Блоки</span> — и нарисуйте его прямо в области шапки на холсте.
                  </p>
                </div>
              </>
            ) : (
              /* Preset mode */
              <>
                <p className="section-label mb-2 mt-1">Стиль шапки</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {HEADER_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => onApplyHeaderStyle?.(preset.id)}
                      className={`glass-card rounded-xl p-2 text-left transition-all ${
                        headerEl.props?.headerStyleId === preset.id
                          ? "ring-2 ring-[#638bff]"
                          : "hover:ring-1 hover:ring-[rgba(99,139,255,0.4)]"
                      }`}
                    >
                      <div
                        className="rounded overflow-hidden mb-1.5 w-full"
                        style={{ height: 44 }}
                        dangerouslySetInnerHTML={{ __html: preset.previewHtml }}
                      />
                      <p className="text-[10px] text-[var(--text-secondary)] text-center">{preset.name}</p>
                    </button>
                  ))}
                </div>

                <div className="h-px bg-[rgba(99,139,255,0.12)] mb-3" />

                <button
                  onClick={onToggleHeaderFreeform}
                  className="glass-card rounded-xl w-full px-3 py-2.5 text-xs text-left flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <PencilRuler className="h-4 w-4 shrink-0 text-blue-400" />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Рисовать от руки</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Как в Figma — размещай элементы внутри шапки</p>
                  </div>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
