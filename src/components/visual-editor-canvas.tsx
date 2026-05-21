"use client";
import type { CanvasElement, ElementType } from "@/types/canvas-element";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LayoutDashboard, Trash2, Copy, ImageUp, Move } from "lucide-react";
import { useState, type CSSProperties, useMemo, useCallback, useRef, useEffect, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface VisualEditorCanvasProps {
  elements: CanvasElement[];
  onRemoveElement: (id: string) => void;
  onUpdateElement: (element: CanvasElement) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementContent: (id: string, content: string) => void;
  onUpdateElementStyle: (id: string, newStyles: React.CSSProperties) => void;
  onMoveElement: (id: string, direction: "up" | "down") => void;
  onEditImage: (element: CanvasElement) => void;
  onCopyElement: (id: string) => void;
  canvasStyles: CSSProperties;
  showGrid: boolean;
  gridSize: string;
  gridType?: 'dots' | 'lines' | 'columns';
  gridColumns?: string;
  gridColumnGutter?: string;
  onSwitchToBlocks?: () => void;
  onSwitchToTemplates?: () => void;
  hasPageContent?: boolean;
  onReorderElements?: (activeId: string, overId: string) => void;
  deviceView?: "desktop" | "tablet" | "mobile";
  activeTool?: ElementType | null;
  onSetActiveTool?: (tool: ElementType | null) => void;
  onAddElementAtPosition?: (type: ElementType, x: number, y: number, width: number, height: number) => void;
  onAddElementToHeader?: (type: ElementType, x: number, y: number, width: number, height: number) => void;
}

const DEFAULT_SIZES: Partial<Record<ElementType, { w: number; h: number }>> = {
  Heading1: { w: 500, h: 60 },
  Heading2: { w: 450, h: 50 },
  Heading3: { w: 400, h: 44 },
  Paragraph: { w: 500, h: 80 },
  Button: { w: 160, h: 48 },
  Image: { w: 300, h: 200 },
  Container: { w: 500, h: 200 },
};

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
const ALL_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
  e: 'e-resize', se: 'se-resize', s: 's-resize',
  sw: 'sw-resize', w: 'w-resize',
};

const parsePx = (val: string | number | undefined, fallback = 0): number => {
  if (val == null) return fallback;
  if (typeof val === 'number') return val;
  // Don't parse relative/keyword values — return fallback
  if (/[%a-zA-Z]/.test(val) && !val.endsWith('px')) return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

// Check if a CSS value is relative (%, auto, etc.) — keep as-is in styles
const isRelativeValue = (val: string | number | undefined): val is string =>
  typeof val === 'string' && (val.includes('%') || val === 'auto' || val === 'max-content' || val === 'min-content' || val === 'fit-content');

export default function VisualEditorCanvas({
  elements,
  onRemoveElement,
  selectedElementId,
  onSelectElement,
  onUpdateElementContent,
  onUpdateElementStyle,
  onEditImage,
  onCopyElement,
  canvasStyles,
  showGrid,
  gridSize,
  gridType = 'dots',
  gridColumns = '12',
  gridColumnGutter = '16',
  onSwitchToBlocks,
  deviceView,
  activeTool,
  onSetActiveTool,
  onAddElementAtPosition,
  onAddElementToHeader,
}: VisualEditorCanvasProps) {
  const freeformRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const editableRefs = useRef<Record<string, HTMLElement | null>>({});

  const [drawState, setDrawState] = useState<{
    startX: number; startY: number; currentX: number; currentY: number;
  } | null>(null);

  const [dragState, setDragState] = useState<{
    elementId: string;
    startMouseX: number; startMouseY: number;
    startLeft: number; startTop: number;
    currentDx: number; currentDy: number;
  } | null>(null);

  const [resizeState, setResizeState] = useState<{
    elementId: string; handle: ResizeHandle;
    startMouseX: number; startMouseY: number;
    startLeft: number; startTop: number;
    startWidth: number; startHeight: number;
    currentDx: number; currentDy: number;
  } | null>(null);

  const [moveMode, setMoveMode] = useState<{
    elementId: string;
    posX: number; posY: number;
    origLeft: number; origTop: number;
    width: number; height: number;
  } | null>(null);

  const [headerDrawState, setHeaderDrawState] = useState<{
    startX: number; startY: number; currentX: number; currentY: number;
  } | null>(null);

  const getFreeformPos = (clientX: number, clientY: number) => {
    const rect = freeformRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: Math.max(0, clientX - rect.left), y: Math.max(0, clientY - rect.top) };
  };


  const computeResizeBounds = (rs: typeof resizeState) => {
    if (!rs) return null;
    const { handle, startLeft: l, startTop: t, startWidth: w, startHeight: h, currentDx: dx, currentDy: dy } = rs;
    const MIN = 30;
    switch (handle) {
      case 'e':  return { left: l,      top: t,      width: Math.max(MIN, w + dx), height: h };
      case 'w':  return { left: l + dx, top: t,      width: Math.max(MIN, w - dx), height: h };
      case 's':  return { left: l,      top: t,      width: w, height: Math.max(MIN, h + dy) };
      case 'n':  return { left: l,      top: t + dy, width: w, height: Math.max(MIN, h - dy) };
      case 'se': return { left: l,      top: t,      width: Math.max(MIN, w + dx), height: Math.max(MIN, h + dy) };
      case 'sw': return { left: l + dx, top: t,      width: Math.max(MIN, w - dx), height: Math.max(MIN, h + dy) };
      case 'ne': return { left: l,      top: t + dy, width: Math.max(MIN, w + dx), height: Math.max(MIN, h - dy) };
      case 'nw': return { left: l + dx, top: t + dy, width: Math.max(MIN, w - dx), height: Math.max(MIN, h - dy) };
    }
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (headerDrawState && headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderDrawState(p => p ? { ...p, currentX: e.clientX - rect.left, currentY: e.clientY - rect.top } : null);
      } else if (drawState) {
        const { x, y } = getFreeformPos(e.clientX, e.clientY);
        setDrawState(p => p ? { ...p, currentX: x, currentY: y } : null);
      } else if (dragState) {
        setDragState(p => p ? { ...p, currentDx: e.clientX - p.startMouseX, currentDy: e.clientY - p.startMouseY } : null);
      } else if (resizeState) {
        setResizeState(p => p ? { ...p, currentDx: e.clientX - p.startMouseX, currentDy: e.clientY - p.startMouseY } : null);
      } else if (moveMode) {
        const { x, y } = getFreeformPos(e.clientX, e.clientY);
        setMoveMode(p => p ? { ...p, posX: x - p.width / 2, posY: y - p.height / 2 } : null);
      }
    };

    const onUp = () => {
      if (headerDrawState && activeTool && onAddElementToHeader) {
        const x = Math.min(headerDrawState.startX, headerDrawState.currentX);
        const y = Math.min(headerDrawState.startY, headerDrawState.currentY);
        const w = Math.abs(headerDrawState.currentX - headerDrawState.startX);
        const h = Math.abs(headerDrawState.currentY - headerDrawState.startY);
        const def = DEFAULT_SIZES[activeTool] ?? { w: 200, h: 60 };
        if (w < 10 || h < 10) {
          onAddElementToHeader(activeTool, Math.max(0, headerDrawState.startX - def.w / 2), Math.max(0, headerDrawState.startY - def.h / 2), def.w, def.h);
        } else {
          onAddElementToHeader(activeTool, x, y, w, h);
        }
        setHeaderDrawState(null);
        onSetActiveTool?.(null);
        return;
      }
      if (drawState && activeTool && onAddElementAtPosition) {
        const x = Math.min(drawState.startX, drawState.currentX);
        const y = Math.min(drawState.startY, drawState.currentY);
        const w = Math.abs(drawState.currentX - drawState.startX);
        const h = Math.abs(drawState.currentY - drawState.startY);
        const def = DEFAULT_SIZES[activeTool] ?? { w: 200, h: 100 };
        if (w < 10 || h < 10) {
          onAddElementAtPosition(activeTool, Math.max(0, drawState.startX - def.w / 2), Math.max(0, drawState.startY - def.h / 2), def.w, def.h);
        } else {
          onAddElementAtPosition(activeTool, x, y, w, h);
        }
        setDrawState(null);
        onSetActiveTool?.(null);
      }
      if (dragState) {
        const DRAG_THRESHOLD = 5;
        const moved = Math.abs(dragState.currentDx) > DRAG_THRESHOLD || Math.abs(dragState.currentDy) > DRAG_THRESHOLD;
        if (moved) {
          const el = elements.find(e => e.id === dragState.elementId);
          if (el) {
            const over = deviceView === 'tablet' ? el.responsiveStyles?.tablet
              : deviceView === 'mobile' ? el.responsiveStyles?.mobile : undefined;
            const merged = { ...el.styles, ...over };
            const newLeft = Math.max(0, dragState.startLeft + dragState.currentDx);
            const newTop = Math.max(0, dragState.startTop + dragState.currentDy);
            onUpdateElementStyle(dragState.elementId, { ...merged, position: 'absolute', left: `${newLeft}px`, top: `${newTop}px` });
          }
        }
        setDragState(null);
      }
      if (resizeState) {
        const bounds = computeResizeBounds(resizeState);
        if (bounds) {
          const el = elements.find(e => e.id === resizeState.elementId);
          if (el) {
            const over = deviceView === 'tablet' ? el.responsiveStyles?.tablet
              : deviceView === 'mobile' ? el.responsiveStyles?.mobile : undefined;
            const merged = { ...el.styles, ...over };
            onUpdateElementStyle(resizeState.elementId, {
              ...merged, position: 'absolute',
              left: `${Math.round(bounds.left)}px`, top: `${Math.round(bounds.top)}px`,
              width: `${Math.round(bounds.width)}px`, height: `${Math.round(bounds.height)}px`,
            });
          }
        }
        setResizeState(null);
      }
    };

    const confirmMove = (mm: typeof moveMode) => {
      if (!mm) return;
      const el = elements.find(e => e.id === mm.elementId);
      if (el) {
        const over = deviceView === 'tablet' ? el.responsiveStyles?.tablet
          : deviceView === 'mobile' ? el.responsiveStyles?.mobile : undefined;
        const merged = { ...el.styles, ...over };
        onUpdateElementStyle(mm.elementId, { ...merged, position: 'absolute', left: `${Math.round(mm.posX)}px`, top: `${Math.round(Math.max(0, mm.posY))}px` });
      }
      setMoveMode(null);
    };

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (moveMode) { setMoveMode(null); return; }
        if (headerDrawState) { setHeaderDrawState(null); return; }
        onSetActiveTool?.(null);
        setDrawState(null);
      }
      if (e.key === 'Enter' && moveMode) {
        e.preventDefault();
        confirmMove(moveMode);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [drawState, dragState, resizeState, moveMode, headerDrawState, activeTool, elements, onAddElementAtPosition, onAddElementToHeader, onSetActiveTool, onUpdateElementStyle, deviceView]);

  const canvasMinHeight = useMemo(() => {
    let max = 900;
    elements.forEach((el, i) => {
      if (el.type === 'Header' || el.type === 'Footer') return;
      const top = parsePx(el.styles?.top as string | number, 20 + i * 130);
      const h = parsePx(el.styles?.height as string | number, DEFAULT_SIZES[el.type]?.h ?? 100);
      max = Math.max(max, top + h + 120);
    });
    return max;
  }, [elements]);

  const dynamicCanvasStyles = useMemo((): CSSProperties => {
    const s: CSSProperties = { width: canvasStyles.width || '100%', minWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column', position: 'relative' };
    if (canvasStyles.background && typeof canvasStyles.background === 'string' && canvasStyles.background.startsWith('linear-gradient')) {
      s.backgroundImage = canvasStyles.background;
      s.backgroundRepeat = 'no-repeat';
      s.backgroundSize = '100% 100%';
    } else {
      s.backgroundColor = canvasStyles.backgroundColor || '#080C14';
    }
    return s;
  }, [canvasStyles]);

  const renderGrid = () => {
    if (!showGrid) return null;
    const sz = Math.max(4, parseInt(gridSize, 10) || 20);
    const cols = Math.max(1, parseInt(gridColumns, 10) || 12);
    const gutter = Math.max(0, parseInt(gridColumnGutter, 10) || 16);
    const base: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 };

    if (gridType === 'dots') {
      return (
        <div style={{
          ...base,
          backgroundImage: `radial-gradient(circle, rgba(99,139,255,0.55) 1px, transparent 1px)`,
          backgroundSize: `${sz}px ${sz}px`,
        }} />
      );
    }
    if (gridType === 'lines') {
      return (
        <div style={{
          ...base,
          backgroundImage: `repeating-linear-gradient(rgba(99,139,255,0.2) 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, rgba(99,139,255,0.2) 0 1px, transparent 1px 100%)`,
          backgroundSize: `${sz}px ${sz}px`,
        }} />
      );
    }
    if (gridType === 'columns') {
      // Column grid: colored fills + gap as gutter, no borders
      return (
        <div style={{ ...base, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, columnGap: `${gutter}px` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ background: 'rgba(99,139,255,0.1)', minHeight: '100%' }} />
          ))}
        </div>
      );
    }
    return null;
  };

  const isTextType = (type: string) => type.startsWith('Heading') || type === 'Paragraph' || type === 'Button';

  const renderInnerContent = (el: CanvasElement, isSelected: boolean) => {
    const over = deviceView === 'tablet' ? el.responsiveStyles?.tablet
      : deviceView === 'mobile' ? el.responsiveStyles?.mobile : undefined;
    const merged = { ...el.styles, ...over } as CSSProperties;
    // Strip layout props — handled by wrapper
    const { position, left, top, width, height, margin, ...innerStyles } = merged;
    const fill: CSSProperties = { width: '100%', height: '100%' };

    if (el.type === 'Header') return <header style={{ width: '100%', display: 'block' }} dangerouslySetInnerHTML={{ __html: el.content || '' }} />;
    if (el.type === 'Footer') return <footer style={{ width: '100%', display: 'block' }} dangerouslySetInnerHTML={{ __html: el.content || '' }} />;

    const editable = isSelected && isTextType(el.type);
    const hasHtml = (c?: string) => c && /<[a-z][\s\S]*>/i.test(c);

    const onBlur = (elId: string, current?: string) => {
      const node = editableRefs.current[elId];
      if (!node) return;
      const nc = node.innerHTML ?? node.innerText ?? '';
      if (nc !== current) onUpdateElementContent(elId, nc);
    };
    const onKeyDn = (e: KeyboardEvent<HTMLElement>, elId: string, type: ElementType) => {
      if (e.key === 'Escape') { e.preventDefault(); editableRefs.current[elId]?.blur(); }
    };

    const editableAttrs = editable ? {
      contentEditable: true as const,
      suppressContentEditableWarning: true,
      ref: (n: HTMLElement | null) => { editableRefs.current[el.id] = n; },
      onBlur: () => onBlur(el.id, el.content),
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => onKeyDn(e, el.id, el.type),
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      style: { ...innerStyles, ...fill, outline: 'none', cursor: 'text', whiteSpace: 'pre-wrap' as const, userSelect: 'none', WebkitUserSelect: 'none' } as CSSProperties,
    } : { style: { ...innerStyles, ...fill } };

    const renderText = (Tag: 'h1' | 'h2' | 'h3' | 'p') => {
      if (editable) return <Tag {...editableAttrs} className="break-words" dangerouslySetInnerHTML={{ __html: el.content ?? '' }} />;
      if (hasHtml(el.content)) return <Tag style={{ ...innerStyles, ...fill }} className="break-words" dangerouslySetInnerHTML={{ __html: el.content! }} />;
      return <Tag style={{ ...innerStyles, ...fill }} className="break-words">{el.content}</Tag>;
    };

    switch (el.type) {
      case 'Heading1': return renderText('h1');
      case 'Heading2': return renderText('h2');
      case 'Heading3': return renderText('h3');
      case 'Paragraph': return renderText('p');
      case 'Button': {
        const hoverCls = el.props?.hoverAnimation || '';
        return (
          <button
            style={{ ...innerStyles, ...fill, cursor: isSelected ? 'text' : 'pointer', userSelect: 'none', WebkitUserSelect: 'none' } as CSSProperties}
            className={`canvas-element-button break-words ${hoverCls}`}
            {...(isSelected ? {
              contentEditable: true, suppressContentEditableWarning: true,
              dangerouslySetInnerHTML: { __html: el.content ?? '' },
              ref: (n: HTMLElement | null) => { editableRefs.current[el.id] = n; },
              onBlur: () => onBlur(el.id, el.content),
              onKeyDown: (e: KeyboardEvent<HTMLElement>) => onKeyDn(e, el.id, el.type),
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
            } : {
              onClick: (e: React.MouseEvent) => { e.stopPropagation(); onSelectElement(el.id); },
              ...(hasHtml(el.content) ? { dangerouslySetInnerHTML: { __html: el.content! } } : { children: el.content }),
            })}
          />
        );
      }
      case 'Image': {
        const isLocal = el.src?.startsWith('/secret1/');
        const src = el.src || 'https://placehold.co/300x200/eee/ccc?text=No+image';
        const effectiveSrc = isLocal ? `${src}?v=${Date.now()}` : src;
        const imgStyle: CSSProperties = {
          width: '100%', height: '100%',
          objectFit: (innerStyles.objectFit as any) || 'cover',
          borderRadius: innerStyles.borderRadius,
          display: 'block',
        };
        return (
          <div style={{ ...fill, position: 'relative', overflow: 'hidden', borderRadius: innerStyles.borderRadius }}>
            {/* Always use plain img — simpler, no fill constraints */}
            <img src={effectiveSrc} alt={el.alt || ''} style={imgStyle} />
          </div>
        );
      }
      case 'Container': {
        const { position: _p, left: _l, top: _t, width: _w, height: _h, margin: _m, ...cInner } = merged;
        return (
          <div style={{ ...cInner, width: '100%', minHeight: '100%', overflow: 'visible', boxSizing: 'border-box' }}>
            {el.children?.map(child => renderFreeElement(child, 0, true))}
          </div>
        );
      }
      default: return null;
    }
  };

  const renderFreeElement = (el: CanvasElement, index: number, isChild = false): React.ReactNode => {
    const isSelected = selectedElementId === el.id;
    const isInMoveMode = moveMode?.elementId === el.id;
    const over = deviceView === 'tablet' ? el.responsiveStyles?.tablet
      : deviceView === 'mobile' ? el.responsiveStyles?.mobile : undefined;
    const merged = { ...el.styles, ...over } as CSSProperties;

    // Compute position
    const hasAbsPos = merged.left !== undefined || merged.top !== undefined;
    const elLeft = hasAbsPos ? parsePx(merged.left as string | number) : 20;
    const elTop = hasAbsPos ? parsePx(merged.top as string | number) : 20 + index * 130;

    const rawW = merged.width as string | number | undefined;
    const rawH = merged.height as string | number | undefined;
    const rawMinH = merged.minHeight as string | number | undefined;
    const useRelativeW = isRelativeValue(rawW);
    const elWidth = useRelativeW ? 0 : parsePx(rawW, DEFAULT_SIZES[el.type]?.w ?? 300);
    // Explicit height only if height is set to a px value (not auto/undefined)
    const hasExplicitH = rawH != null && !isRelativeValue(rawH) && String(rawH) !== 'auto';
    const elHeight = hasExplicitH
      ? parsePx(rawH, DEFAULT_SIZES[el.type]?.h ?? 100)
      : parsePx(rawMinH, DEFAULT_SIZES[el.type]?.h ?? 100);

    const isResizing = resizeState?.elementId === el.id;
    let renderLeft = elLeft, renderTop = elTop, renderWidth = elWidth, renderHeight = elHeight;

    if (isInMoveMode) {
      renderLeft = moveMode!.posX;
      renderTop = Math.max(0, moveMode!.posY);
    }
    if (isResizing) {
      const rb = computeResizeBounds(resizeState);
      if (rb) { renderLeft = rb.left; renderTop = rb.top; renderWidth = rb.width; renderHeight = rb.height; }
    }

    const wrapperStyle: CSSProperties = isChild
      ? {
          position: 'relative',
          flex: (merged.flex as string) || '1',
          display: (merged.display as string) || 'block',
          flexDirection: (merged.flexDirection as CSSProperties['flexDirection']) || undefined,
          alignItems: (merged.alignItems as CSSProperties['alignItems']) || undefined,
          justifyContent: (merged.justifyContent as CSSProperties['justifyContent']) || undefined,
          gap: merged.gap as string || undefined,
          flexWrap: (merged.flexWrap as CSSProperties['flexWrap']) || undefined,
          // Include dimensions so child images / containers render correctly
          width: useRelativeW ? (rawW as string) : (elWidth > 0 ? `${elWidth}px` : '100%'),
          ...(elHeight > 0 ? { height: `${elHeight}px` } : {}),
          ...(rawMinH ? { minHeight: rawMinH as string } : {}),
          overflow: 'hidden',
          boxSizing: 'border-box',
        }
      : {
          position: 'absolute',
          left: `${Math.round(renderLeft)}px`,
          top: `${Math.round(renderTop)}px`,
          width: useRelativeW ? (rawW as string) : `${Math.round(renderWidth)}px`,
          // Use auto height when no explicit height — let content define height via minHeight
          height: hasExplicitH ? `${Math.round(renderHeight)}px` : 'auto',
          minHeight: hasExplicitH ? undefined : `${Math.round(renderHeight)}px`,
          zIndex: isSelected ? 100 : (isInMoveMode ? 200 : 10),
          cursor: activeTool ? 'crosshair' : (isInMoveMode ? 'grabbing' : 'default'),
          userSelect: 'none',
          boxSizing: 'border-box',
          pointerEvents: isInMoveMode ? 'none' : 'auto',
          opacity: isInMoveMode ? 0.85 : 1,
        };

    return (
      <div
        key={el.id}
        data-element-id={el.id}
        style={wrapperStyle}
        className={cn('group', isSelected && 'ring-2 ring-[rgba(99,139,255,0.7)] ring-offset-1 ring-offset-[#080C14]')}
        onClick={e => {
          if (activeTool) return;
          e.stopPropagation();
          const active = document.activeElement as HTMLElement | null;
          if (active && active.isContentEditable) active.blur();
          onSelectElement(el.id);
        }}
      >
        {renderInnerContent(el, isSelected)}

        {/* Resize handles */}
        {isSelected && !isChild && ALL_HANDLES.map(handle => {
          const hs: CSSProperties = {
            position: 'absolute', width: 8, height: 8,
            background: '#638bff', border: '1.5px solid #fff',
            borderRadius: 2, zIndex: 200, cursor: HANDLE_CURSORS[handle],
          };
          if (handle.includes('w')) hs.left = -5;
          if (handle.includes('e')) hs.right = -5;
          if (handle === 'n' || handle === 's') { hs.left = '50%'; hs.marginLeft = -4; }
          if (handle === 'w' || handle === 'e') { hs.top = '50%'; hs.marginTop = -4; }
          if (handle.includes('n')) hs.top = -5;
          if (handle.includes('s')) hs.bottom = -5;
          return (
            <div
              key={handle}
              data-resize-handle={handle}
              style={hs}
              onMouseDown={e => {
                e.stopPropagation();
                e.preventDefault();
                setResizeState({ elementId: el.id, handle, startMouseX: e.clientX, startMouseY: e.clientY, startLeft: elLeft, startTop: elTop, startWidth: elWidth, startHeight: elHeight, currentDx: 0, currentDy: 0 });
              }}
            />
          );
        })}

        {/* Toolbar */}
        {isSelected && !isChild && (
          <div
            className="element-controls absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 float-toolbar p-1 rounded-xl"
            style={{ top: 'calc(100% + 4px)', zIndex: 300, whiteSpace: 'nowrap' }}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            <Button
              variant="ghost" size="icon"
              className={`h-6 w-6 ${isInMoveMode ? 'text-[#638bff] bg-[rgba(99,139,255,0.15)]' : ''}`}
              onClick={() => {
                if (isInMoveMode) { setMoveMode(null); return; }
                setMoveMode({ elementId: el.id, posX: elLeft, posY: elTop, origLeft: elLeft, origTop: elTop, width: elWidth, height: elHeight });
              }}
              title="Переместить (Enter — подтвердить, Esc — отмена)"
            >
              <Move className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCopyElement(el.id)} title="Копировать">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {el.type === 'Image' && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditImage(el)} title="Изменить изображение">
                <ImageUp className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={() => onRemoveElement(el.id)} title="Удалить">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {el.type === 'Button' && el.props?.href && !isSelected && (
          <span style={{ position: 'absolute', top: -6, right: -6, background: '#638bff', borderRadius: '50%', width: 14, height: 14, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 20, pointerEvents: 'none' }}>🔗</span>
        )}
      </div>
    );
  };

  const renderSpecial = (el: CanvasElement) => {
    const isSelected = selectedElementId === el.id;
    const isHeader = el.type === 'Header';
    const freeform = isHeader && !!el.props?.freeform;
    const over = deviceView === 'tablet' ? el.responsiveStyles?.tablet
      : deviceView === 'mobile' ? el.responsiveStyles?.mobile : undefined;
    const merged = { ...el.styles, ...over } as CSSProperties;

    if (freeform) {
      const freeH = parsePx(merged.height as string | number, 80);
      const isDrawingInHeader = activeTool && activeTool !== 'Header' && activeTool !== 'Footer';
      return (
        <div
          key={el.id}
          ref={headerRef}
          data-element-id={el.id}
          style={{
            position: 'relative', width: '100%', flexShrink: 0, zIndex: 100,
            height: freeH,
            backgroundColor: (merged.backgroundColor as string) || 'rgba(8,12,20,0.95)',
            borderBottom: (merged.borderBottom as string) || '1px solid rgba(99,139,255,0.18)',
            cursor: isDrawingInHeader ? 'crosshair' : 'default',
            boxSizing: 'border-box',
            overflow: 'visible',
          }}
          className={cn(isSelected && 'ring-2 ring-[rgba(99,139,255,0.7)]')}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id); }}
          onMouseDown={e => {
            if (isDrawingInHeader) {
              if ((e.target as HTMLElement).dataset.elementId && (e.target as HTMLElement).dataset.elementId !== el.id) return;
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setHeaderDrawState({ startX: x, startY: y, currentX: x, currentY: y });
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {/* Children inside freeform header */}
          {el.children?.map((child, i) => renderFreeElement(child, i, false))}

          {/* Draw preview inside header */}
          {headerDrawState && (
            <div style={{
              position: 'absolute', pointerEvents: 'none', zIndex: 1000, boxSizing: 'border-box',
              left: Math.min(headerDrawState.startX, headerDrawState.currentX),
              top: Math.min(headerDrawState.startY, headerDrawState.currentY),
              width: Math.abs(headerDrawState.currentX - headerDrawState.startX),
              height: Math.abs(headerDrawState.currentY - headerDrawState.startY),
              border: '2px dashed #638bff', background: 'rgba(99,139,255,0.08)',
            }} />
          )}

          {/* Bottom resize handle — always visible when header selected */}
          <div
            style={{
              position: 'absolute', bottom: -4, left: 0, right: 0, height: 8,
              cursor: 's-resize', zIndex: 201,
              background: isSelected ? 'rgba(99,139,255,0.45)' : 'transparent',
              borderRadius: 3,
            }}
            onMouseDown={e => {
              e.stopPropagation();
              e.preventDefault();
              const startY = e.clientY;
              const startH = freeH;
              const onMove = (mv: MouseEvent) => {
                const newH = Math.max(40, startH + (mv.clientY - startY));
                onUpdateElementStyle(el.id, { ...merged, height: `${Math.round(newH)}px` });
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          />

          {/* Toolbar */}
          {isSelected && (
            <div
              className="element-controls absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 float-toolbar p-1 rounded-xl"
              style={{ top: 'calc(100% + 8px)', zIndex: 300, whiteSpace: 'nowrap' }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={() => onRemoveElement(el.id)} title="Удалить шапку">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={el.id}
        style={{ ...merged, width: '100%', position: 'relative', flexShrink: 0, zIndex: isHeader ? 100 : 1, cursor: 'default' }}
        className={cn(isSelected && 'ring-2 ring-[rgba(99,139,255,0.7)]')}
        onClick={e => { e.stopPropagation(); onSelectElement(el.id); }}
      >
        {renderInnerContent(el, isSelected)}
        {isSelected && (
          <div
            className="element-controls absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 float-toolbar p-1 rounded-xl"
            style={{ top: 'calc(100% + 4px)', zIndex: 300, whiteSpace: 'nowrap' }}
            onClick={e => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={() => onRemoveElement(el.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const header = elements.find(e => e.type === 'Header');
  const footer = elements.find(e => e.type === 'Footer');
  const freeElements = elements.filter(e => e.type !== 'Header' && e.type !== 'Footer');

  const drawPreview = drawState ? (
    <div style={{
      position: 'absolute', pointerEvents: 'none', zIndex: 1000, boxSizing: 'border-box',
      left: Math.min(drawState.startX, drawState.currentX),
      top: Math.min(drawState.startY, drawState.currentY),
      width: Math.abs(drawState.currentX - drawState.startX),
      height: Math.abs(drawState.currentY - drawState.startY),
      border: '2px dashed #638bff', background: 'rgba(99,139,255,0.08)',
    }} />
  ) : null;

  const canvasCursor = activeTool && activeTool !== 'Header' && activeTool !== 'Footer' ? 'crosshair' : 'default';

  return (
    <div className="editor-area-background w-full h-full overflow-auto">
      <div id="visual-canvas-proper" className="mx-auto shadow-lg" style={{ ...dynamicCanvasStyles, cursor: canvasCursor }}>
        {header && renderSpecial(header)}

        {/* Freeform canvas zone */}
        <div
          ref={freeformRef}
          style={{ position: 'relative', flex: 1, minHeight: canvasMinHeight, cursor: moveMode ? 'crosshair' : canvasCursor }}
          onMouseDown={e => {
            if (moveMode) {
              // Click to place the element in move mode
              const { x, y } = getFreeformPos(e.clientX, e.clientY);
              const el = elements.find(el => el.id === moveMode.elementId);
              if (el) {
                const over = deviceView === 'tablet' ? el.responsiveStyles?.tablet
                  : deviceView === 'mobile' ? el.responsiveStyles?.mobile : undefined;
                const merged = { ...el.styles, ...over };
                onUpdateElementStyle(moveMode.elementId, { ...merged, position: 'absolute', left: `${Math.round(x - moveMode.width / 2)}px`, top: `${Math.round(Math.max(0, y - moveMode.height / 2))}px` });
              }
              setMoveMode(null);
              return;
            }
            if (e.target !== e.currentTarget && (e.target as HTMLElement).id !== 'grid-overlay-actual') return;
            if (activeTool && activeTool !== 'Header' && activeTool !== 'Footer') {
              const { x, y } = getFreeformPos(e.clientX, e.clientY);
              setDrawState({ startX: x, startY: y, currentX: x, currentY: y });
              e.preventDefault();
              return;
            }
            const active = document.activeElement as HTMLElement | null;
            if (active && active.isContentEditable) active.blur();
            onSelectElement(null);
          }}
          onClick={e => {
            if (!moveMode && e.target === e.currentTarget) onSelectElement(null);
          }}
        >
          {renderGrid()}
          {freeElements.length === 0 && !activeTool && (
            <button
              className="flex flex-col items-center justify-center pmi-panel-enter"
              style={{ position: 'absolute', inset: 0, zIndex: 1, padding: '48px 32px', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
              onClick={() => onSwitchToBlocks?.()}
            >
              <div style={{ width: 64, height: 64, marginBottom: 24, borderRadius: 16, background: 'rgba(99,139,255,0.1)', border: '1px solid rgba(99,139,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutDashboard style={{ width: 32, height: 32, color: 'rgba(99,139,255,0.6)' }} />
              </div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>Страница пустая</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', maxWidth: 380, lineHeight: 1.7 }}>
                Нажмите чтобы открыть панель элементов
              </p>
            </button>
          )}
          {activeTool && !moveMode && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'rgba(99,139,255,0.15)', border: '1px solid rgba(99,139,255,0.4)', borderRadius: 8, padding: '4px 12px', color: '#638bff', fontSize: 12, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              Нарисуйте элемент на холсте · Esc — отмена
            </div>
          )}
          {moveMode && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'rgba(99,139,255,0.15)', border: '1px solid rgba(99,139,255,0.4)', borderRadius: 8, padding: '4px 12px', color: '#638bff', fontSize: 12, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              Кликните чтобы разместить · Enter — подтвердить · Esc — отмена
            </div>
          )}
          {freeElements.map((el, i) => renderFreeElement(el, i))}
          {drawPreview}
        </div>

        {footer && renderSpecial(footer)}
      </div>
    </div>
  );
}
