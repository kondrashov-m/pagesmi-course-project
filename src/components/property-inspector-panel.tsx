"use client";

import type { CanvasElement, ElementType } from "@/types/canvas-element";
import { HEADER_PRESETS, FOOTER_PRESETS } from "@/lib/header-footer-presets";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CSSProperties } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AlertTriangle, ImageUp as ImageIconProp, Palette, Droplets, List, Type as TypeIcon, Brush, PlusCircle, Heading1, Heading2, Heading3, Monitor, Tablet, Smartphone, BookmarkPlus } from "lucide-react"; 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { PREDEFINED_LOGO_ICONS, type PredefinedLogoIconKey } from "@/lib/predefined-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const FONT_FAMILIES = [
  // --- Sans-serif ---
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "Open Sans, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
  { label: "Work Sans", value: "Work Sans, sans-serif" },
  { label: "DM Sans", value: "DM Sans, sans-serif" },
  { label: "Space Grotesk", value: "Space Grotesk, sans-serif" },
  { label: "Manrope", value: "Manrope, sans-serif" },
  { label: "Figtree", value: "Figtree, sans-serif" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans, sans-serif" },
  { label: "Outfit", value: "Outfit, sans-serif" },
  { label: "Raleway", value: "Raleway, sans-serif" },
  { label: "Oswald", value: "Oswald, sans-serif" },
  { label: "Barlow", value: "Barlow, sans-serif" },
  { label: "Karla", value: "Karla, sans-serif" },
  { label: "Mulish", value: "Mulish, sans-serif" },
  { label: "Ubuntu", value: "Ubuntu, sans-serif" },
  { label: "Josefin Sans", value: "Josefin Sans, sans-serif" },
  { label: "Bebas Neue", value: "Bebas Neue, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  // --- Serif ---
  { label: "Playfair Display", value: "Playfair Display, serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Lora", value: "Lora, serif" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond, serif" },
  { label: "EB Garamond", value: "EB Garamond, serif" },
  { label: "Libre Baskerville", value: "Libre Baskerville, serif" },
  { label: "Cinzel", value: "Cinzel, serif" },
  { label: "PT Serif", value: "PT Serif, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif" },
  // --- Display / Декоративные ---
  { label: "Pacifico", value: "Pacifico, cursive" },
  { label: "Dancing Script", value: "Dancing Script, cursive" },
  { label: "Lobster", value: "Lobster, cursive" },
  { label: "Caveat", value: "Caveat, cursive" },
  { label: "Comfortaa", value: "Comfortaa, cursive" },
  { label: "Abril Fatface", value: "Abril Fatface, cursive" },
  { label: "Righteous", value: "Righteous, cursive" },
  // --- Моноширинные ---
  { label: "JetBrains Mono", value: "JetBrains Mono, monospace" },
  { label: "Fira Code", value: "Fira Code, monospace" },
  { label: "Source Code Pro", value: "Source Code Pro, monospace" },
  { label: "Courier New", value: "Courier New, Courier, monospace" },
];

const isValidHexColor = (color: string): boolean => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color);
const isRgbOrRgbaColor = (color: string): boolean => /^rgba?\([\s\d%,.-]+\)$/.test(color);
const isHslOrHslaColor = (color: string): boolean => /^hsla?\([\s\d%,.-]+\)$/.test(color);

const hexToRgba = (hex: string, opacity: number): string => {
  if (!isValidHexColor(hex)) return `rgba(255, 255, 255, ${opacity / 100})`; 
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

const parseRgba = (rgba: string | undefined): { color: string, opacity: number } => {
  if (!rgba || !isRgbOrRgbaColor(rgba)) return { color: '#FFFFFF', opacity: 100 };
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { color: '#FFFFFF', opacity: 100 };
  const [, r, g, b, a] = match;
  const hex = `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
  return { color: hex, opacity: a !== undefined ? Math.round(parseFloat(a) * 100) : 100 };
};


interface PropertyInspectorPanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElementStyle: (id: string, newCompleteStyles: CSSProperties) => void;
  onUpdateElementContent: (id: string, newContent: string) => void;
  onUpdateElementProp: (id: string, propName: string, propValue: any) => void;
  onEditImage?: () => void;
  onAddChildElement: (elementType: ElementType, attributes?: Partial<Pick<CanvasElement, 'props'>>) => void;
  onOpenImageDialogForContainer: () => void;
  onApplyHeaderStyle?: (styleId: string) => void;
  onApplyFooterStyle?: (styleId: string) => void;
  deviceView?: "desktop" | "tablet" | "mobile";
  onSaveBlock?: (element: import("@/types/canvas-element").CanvasElement, name: string) => void;
}

export default function PropertyInspectorPanel({
  selectedElement,
  onUpdateElementStyle,
  onUpdateElementContent,
  onUpdateElementProp,
  onEditImage,
  onAddChildElement,
  onOpenImageDialogForContainer,
  onApplyHeaderStyle,
  onApplyFooterStyle,
  deviceView = "desktop",
  onSaveBlock,
}: PropertyInspectorPanelProps) {

  const effectiveStyles = useMemo((): CSSProperties => {
    if (!selectedElement) return {};
    const responsive =
      deviceView === "tablet" ? selectedElement.responsiveStyles?.tablet :
      deviceView === "mobile" ? selectedElement.responsiveStyles?.mobile :
      undefined;
    return { ...selectedElement.styles, ...responsive };
  }, [selectedElement, deviceView]);

  type BackgroundType = "solid" | "gradient";
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("solid");
  
  const [localElementSolidBgColor, setLocalElementSolidBgColor] = useState("#FFFFFF");
  const [localElementSolidBgOpacity, setLocalElementSolidBgOpacity] = useState(100); 

  const [localGradientColor1, setLocalGradientColor1] = useState("#FF0000");
  const [localGradientColor2, setLocalGradientColor2] = useState("#0000FF");
  const [localGradientAngle, setLocalGradientAngle] = useState("90");
  
  const [localElementBorderColor, setLocalElementBorderColor] = useState("#000000");
  const [localElementTextColor, setLocalElementTextColor] = useState("#000000");

  const [localHeaderIconColor, setLocalHeaderIconColor] = useState("#007bff"); 
  const [localHeaderSiteNameColor, setLocalHeaderSiteNameColor] = useState("#333333"); 


  const getCurrentValue = useCallback((
    sourceStyles: CSSProperties | undefined,
    property: keyof CSSProperties | 'borderColorForPicker' | 'rotate',
    defaultValue: string = ""
  ): string => {
    if (!sourceStyles) return defaultValue;

    if (property === 'borderColorForPicker') {
        const borderStyle = sourceStyles?.border?.toString();
        if (borderStyle) {
            const colorMatch = borderStyle.match(/#(?:[0-9a-fA-F]{3}){1,2}\b|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/i);
            if (colorMatch && (isValidHexColor(colorMatch[0]) || isRgbOrRgbaColor(colorMatch[0]) || isHslOrHslaColor(colorMatch[0]) )) return colorMatch[0];
        }
        if (sourceStyles.borderColor && typeof sourceStyles.borderColor === 'string' && (isValidHexColor(sourceStyles.borderColor) || isRgbOrRgbaColor(sourceStyles.borderColor) || isHslOrHslaColor(sourceStyles.borderColor))) {
            return sourceStyles.borderColor;
        }
        return '#000000';
    }

    const currentValue = sourceStyles?.[property as keyof CSSProperties];
    const lengthProps = ['fontSize', 'width', 'height', 'minHeight', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'borderRadius', 'borderWidth', 'letterSpacing', 'lineHeight'];

    if (property === 'rotate') {
        const transform = sourceStyles?.transform;
        if (typeof transform === 'string' && transform.startsWith('rotate(')) {
            const match = transform.match(/rotate\(([^deg)]+)deg\)/);
            return match ? match[1] : defaultValue;
        }
        return defaultValue;
    }
    
    if (property === 'backgroundColor' && typeof currentValue === 'string' && isRgbOrRgbaColor(currentValue)) {
        return currentValue; 
    }

    if (property === 'color' || property === 'borderColor' || (property === 'backgroundColor' && typeof currentValue === 'string' && isValidHexColor(currentValue))) {
        if (typeof currentValue === 'string' && (isValidHexColor(currentValue) || isRgbOrRgbaColor(currentValue) || isHslOrHslaColor(currentValue))) {
            return currentValue;
        }
         if (typeof currentValue === 'string' && currentValue.startsWith('hsl(var(--))') ) {
             if (property === 'color') return selectedElement?.styles?.color || '#000000';
             if (property === 'borderColor') return selectedElement?.styles?.borderColor ||'#000000';
             if (property === 'backgroundColor') return selectedElement?.styles?.backgroundColor || '#FFFFFF';
        }
        return defaultValue || (property === 'backgroundColor' ? '#FFFFFF' : '#000000');
    }

    if (typeof currentValue === 'string') {
        if (lengthProps.includes(property as string)) {
            if (currentValue === '0px' || currentValue === '0') return '0';
            if (currentValue.match(/%|auto|rem|em|vh|vw|ch|ex|vmin|vmax|min-content|max-content|fit-content|calc\(|var\(/i)) {
                 return currentValue;
            }
            if (currentValue.endsWith('px')) {
                return currentValue.replace('px', '');
            }
            return currentValue;
        }
        return currentValue;
    }
    if (typeof currentValue === 'number') {
        return currentValue.toString();
    }
    return defaultValue;
  }, [selectedElement]);

  const getBaseStylesWithoutBackground = (currentStyles?: CSSProperties): CSSProperties => {
    if (!currentStyles) return {};
    const { background, backgroundColor, ...rest } = currentStyles;
    return rest;
  };
  
  useEffect(() => {
    if (!selectedElement) {
        setBackgroundType("solid");
        setLocalElementSolidBgColor("#FFFFFF");
        setLocalElementSolidBgOpacity(100);
        setLocalGradientColor1("#FF0000");
        setLocalGradientColor2("#0000FF");
        setLocalGradientAngle("90");
        setLocalElementBorderColor("#000000");
        setLocalElementTextColor("#000000");
        setLocalHeaderIconColor("hsl(var(--primary))");
        setLocalHeaderSiteNameColor("hsl(var(--foreground))");
        return;
    }

    const styles = effectiveStyles || {};
    let determinedNewBackgroundType: BackgroundType = "solid";

    if ((selectedElement.type === "Header" || selectedElement.type === "Footer" || selectedElement.type === "Container") && 
        styles.background && typeof styles.background === 'string' &&
        styles.background.startsWith('linear-gradient')) {
        determinedNewBackgroundType = "gradient";
    }
    
    if (backgroundType !== determinedNewBackgroundType) {
        setBackgroundType(determinedNewBackgroundType);
    }
    
    // ИСПРАВЛЕНО: добавлена проверка typeof styles.background === 'string'
    if (determinedNewBackgroundType === "gradient" && styles.background && typeof styles.background === 'string') {
        const gradientMatch = styles.background.match(/linear-gradient\(([^,]+deg),\s*([^,]+),\s*([^)]+)\)/);
        const newAngle = gradientMatch ? gradientMatch[1].replace('deg', '').trim() : "90";
        const newColor1 = gradientMatch ? gradientMatch[2].trim() : "#FF0000";
        const newColor2 = gradientMatch ? gradientMatch[3].trim() : "#0000FF";

        if (localGradientAngle !== newAngle) setLocalGradientAngle(newAngle);
        if (localGradientColor1 !== newColor1) setLocalGradientColor1(newColor1);
        if (localGradientColor2 !== newColor2) setLocalGradientColor2(newColor2);
        
        if (localElementSolidBgColor !== (selectedElement.type === "Container" ? "hsl(var(--card))" : '#FFFFFF')) setLocalElementSolidBgColor(selectedElement.type === "Container" ? "hsl(var(--card))" : '#FFFFFF');
        if (localElementSolidBgOpacity !== 100) setLocalElementSolidBgOpacity(100);

    } else { 
        let solidColor = selectedElement.type === "Container" ? 'hsl(var(--card))' : '#FFFFFF'; 
        let solidOpacity = 100;

        if (typeof styles.backgroundColor === 'string' && isRgbOrRgbaColor(styles.backgroundColor)) {
            const parsed = parseRgba(styles.backgroundColor);
            solidColor = parsed.color;
            solidOpacity = parsed.opacity;
        } else if (typeof styles.backgroundColor === 'string' && isValidHexColor(styles.backgroundColor)) {
            solidColor = styles.backgroundColor;
        } else if (typeof styles.backgroundColor === 'string' && styles.backgroundColor.startsWith('hsl(var(--))') ) { 
             solidColor = styles.backgroundColor; 
        } else if (selectedElement.type === "Footer" && (!styles.backgroundColor || !(isValidHexColor(styles.backgroundColor as string) || isRgbOrRgbaColor(styles.backgroundColor as string) || (typeof styles.backgroundColor === 'string' && styles.backgroundColor.startsWith('hsl(var(--))'))))) {
             solidColor = '#222222';
        } else if (selectedElement.type === "Header" && (!styles.backgroundColor || !(isValidHexColor(styles.backgroundColor as string) || isRgbOrRgbaColor(styles.backgroundColor as string) || (typeof styles.backgroundColor === 'string' && styles.backgroundColor.startsWith('hsl(var(--))'))))){
            solidColor = 'hsl(var(--card))'; 
        } else if (!styles.backgroundColor && (selectedElement.type === "Header" || selectedElement.type === "Footer")){
            solidColor = selectedElement.type === "Header" ? 'hsl(var(--card))' : '#222222';
        } else if (selectedElement.type === "Container" && !styles.backgroundColor) {
            solidColor = 'hsl(var(--card))';
        }
        
        if (localElementSolidBgColor !== solidColor) setLocalElementSolidBgColor(solidColor);
        if (localElementSolidBgOpacity !== solidOpacity) setLocalElementSolidBgOpacity(solidOpacity);
        
        if (localGradientAngle !== "90") setLocalGradientAngle("90");
        if (localGradientColor1 !== "#FF0000") setLocalGradientColor1("#FF0000");
        if (localGradientColor2 !== "#0000FF") setLocalGradientColor2("#0000FF");
    }
    
    const borderStyle = styles?.border?.toString();
    let currentBorderColor = '#000000';
    if (borderStyle) {
      const m = borderStyle.match(/#(?:[0-9a-fA-F]{3}){1,2}\b|rgb\([^)]+\)|rgba\([^)]+\)/i);
      if (m) currentBorderColor = m[0];
    } else if (styles.borderColor && typeof styles.borderColor === 'string') {
      currentBorderColor = styles.borderColor;
    }
    if (localElementBorderColor !== currentBorderColor) setLocalElementBorderColor(currentBorderColor);

    if (["Heading1", "Heading2", "Heading3", "Paragraph", "Button"].includes(selectedElement.type)) {
        const currentTextColor = (typeof styles.color === 'string' && styles.color) ? styles.color : 'hsl(var(--foreground))';
        if (localElementTextColor !== currentTextColor) setLocalElementTextColor(currentTextColor);
    }

    if (selectedElement.type === "Header") {
      const newHeaderIconColor = selectedElement.props?.headerIconColor || "#638bff";
      const newHeaderSiteNameColor = selectedElement.props?.headerSiteNameColor || "#e8eaf6";
      if (localHeaderIconColor !== newHeaderIconColor) setLocalHeaderIconColor(newHeaderIconColor);
      if (localHeaderSiteNameColor !== newHeaderSiteNameColor) setLocalHeaderSiteNameColor(newHeaderSiteNameColor);
    }

  // Only re-init local state when the selected element CHANGES (not on every content edit)
  }, [selectedElement?.id, deviceView]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleBackgroundTypeChange = (newType: BackgroundType) => {
    if (!selectedElement || (selectedElement.type !== "Header" && selectedElement.type !== "Footer" && selectedElement.type !== "Container")) return;
    
    setBackgroundType(newType); 

    const baseStyles = getBaseStylesWithoutBackground(effectiveStyles);
    let newCompleteStyles: CSSProperties = { ...baseStyles };

    if (newType === "solid") {
      if (selectedElement.type === "Header") { 
        newCompleteStyles.backgroundColor = hexToRgba(localElementSolidBgColor, localElementSolidBgOpacity);
      } else { 
        newCompleteStyles.backgroundColor = localElementSolidBgColor; 
      }
    } else { 
      newCompleteStyles.background = `linear-gradient(${localGradientAngle}deg, ${localGradientColor1}, ${localGradientColor2})`;
    }
    onUpdateElementStyle(selectedElement.id, newCompleteStyles);
  };

  const handleSolidBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement) return;
    const color = e.target.value;
    setLocalElementSolidBgColor(color);

    const baseStyles = getBaseStylesWithoutBackground(effectiveStyles);
    let newCompleteStyles: CSSProperties = { ...baseStyles };
    
    if (selectedElement.type === "Header") { 
        newCompleteStyles.backgroundColor = hexToRgba(color, localElementSolidBgOpacity);
    } else { 
        newCompleteStyles.backgroundColor = color;
    }
    onUpdateElementStyle(selectedElement.id, newCompleteStyles);
  };
  
  const handleSolidBackgroundOpacityChange = (opacityValue: number[]) => {
      if (!selectedElement || selectedElement.type !== "Header") return; 
      const newOpacity = opacityValue[0];
      setLocalElementSolidBgOpacity(newOpacity);
      
      const baseStyles = getBaseStylesWithoutBackground(effectiveStyles);
      let newCompleteStyles: CSSProperties = { ...baseStyles };
      newCompleteStyles.backgroundColor = hexToRgba(localElementSolidBgColor, newOpacity);
      onUpdateElementStyle(selectedElement.id, newCompleteStyles);
  };






  const handleStyleChange = (property: keyof CSSProperties, value: string | number) => {
    if (!selectedElement) return;

    let processedValue: string | number | undefined = value;
    let isDeletingProperty = false;

    const numericPropsWithoutUnit = ['opacity', 'zIndex', 'fontWeight']; 
    const lengthProps = ['fontSize', 'width', 'height', 'minHeight', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'borderRadius', 'borderWidth', 'letterSpacing', 'lineHeight'];
    
    let currentStyles = effectiveStyles || {};
    let newCompleteStyles: CSSProperties = {...currentStyles};


    if (typeof value === 'string') {
        if (lengthProps.includes(property as string)) {
            if (value && value.trim() !== "" && !isNaN(Number(value)) && !value.match(/%|auto|rem|em|vh|vw|px|min-content|max-content|fit-content/i) && value.trim() !== '0') {
              processedValue = `${value}px`;
            } else if (value.trim() === "" && property !== 'lineHeight') { 
              isDeletingProperty = true;
              processedValue = undefined;
            } else if (property === 'lineHeight' && (value.trim() === "" || value.trim() === "normal")) {
              processedValue = "normal"; 
            }
        } else if (numericPropsWithoutUnit.includes(property as string)) {
            if (value && value.trim() !== "" && !isNaN(Number(value))) {
                processedValue = Number(value);
            } else if (value.trim() === "") {
                isDeletingProperty = true;
                processedValue = undefined;
            }
        } else if (property === 'rotate') {
             
        } else if (value.trim() === "" && (property === 'color' || property === 'borderColor' || property === 'fontFamily' || property === 'transform' || property === 'border' || property === 'textAlign')) {
            isDeletingProperty = true;
            processedValue = undefined;
        }
    }


    if (isDeletingProperty) {
        delete (newCompleteStyles as any)[property];
        if (property === 'rotate') delete newCompleteStyles.transform;
    } else if (property === 'rotate') {
        const numValue = parseFloat(value as string);
        if (!isNaN(numValue)) {
            newCompleteStyles.transform = `rotate(${numValue}deg)`;
        } else if ((value as string).trim() === "") {
            delete newCompleteStyles.transform;
        }
    } else {
        (newCompleteStyles as any)[property] = processedValue;
    }
    
    // Background is already part of effectiveStyles (spread into currentStyles above)
    // Don't rebuild background here — that would overwrite it with stale local state.
    // Background changes go through dedicated handlers (handleBackgroundTypeChange, etc.)
    onUpdateElementStyle(selectedElement.id, newCompleteStyles);
  };


  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (selectedElement) {
      onUpdateElementContent(selectedElement.id, e.target.value);
    }
  };

  const handlePropChange = (propName: string, value: any) => {
    if (selectedElement) {
      if (propName === 'headerIconColor') setLocalHeaderIconColor(value);
      if (propName === 'headerSiteNameColor') setLocalHeaderSiteNameColor(value);
      onUpdateElementProp(selectedElement.id, propName, value);
    }
  };

  const predefinedLogoIconKeys = Object.keys(PREDEFINED_LOGO_ICONS) as PredefinedLogoIconKey[];


  const isTextElement = selectedElement && ["Heading1", "Heading2", "Heading3", "Paragraph", "Button"].includes(selectedElement.type);
  const isStylableBackgroundElement = selectedElement && ["Header", "Footer", "Button", "Container"].includes(selectedElement.type);
  const allowsGradientBackground = selectedElement && ["Header", "Footer", "Container"].includes(selectedElement.type);


  if (!selectedElement) {
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center h-full min-h-48">
        <AlertTriangle className="h-10 w-10 text-[var(--text-muted)] mb-3" />
        <p className="text-sm text-[var(--text-secondary)]">
          Выберите элемент на холсте, чтобы изменить его свойства.
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Свойства холста настраиваются в левой панели (вкладка «Холст»).
        </p>
      </div>
    );
  }

  const [saveBlockName, setSaveBlockName] = useState("");
  const [showSaveName, setShowSaveName] = useState(false);

  const deviceLabels: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    desktop: { icon: <Monitor size={11}/>, label: "Десктоп", color: "#638bff" },
    tablet:  { icon: <Tablet size={11}/>,  label: "Планшет", color: "#f59e0b" },
    mobile:  { icon: <Smartphone size={11}/>, label: "Мобильный", color: "#10b981" },
  };
  const dv = deviceLabels[deviceView] ?? deviceLabels.desktop;

  return (
    <div className="space-y-0 p-4 text-xs">
      {/* Device indicator + Save block */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:6, background:"rgba(15,22,48,0.6)", border:`1px solid ${dv.color}40` }}>
          <span style={{ color: dv.color }}>{dv.icon}</span>
          <span style={{ color: dv.color, fontSize:10, fontWeight:600 }}>{dv.label}</span>
          {deviceView !== "desktop" && <span style={{ color:"rgba(232,234,246,0.4)", fontSize:9 }}>• overrides</span>}
        </div>
        {onSaveBlock && selectedElement.type !== "Header" && selectedElement.type !== "Footer" && (
          <button
            onClick={() => setShowSaveName(v => !v)}
            title="Сохранить блок"
            style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:6, background:"rgba(99,139,255,0.1)", border:"1px solid rgba(99,139,255,0.25)", color:"#638bff", fontSize:10, fontWeight:600, cursor:"pointer" }}
          >
            <BookmarkPlus size={11}/> Сохранить
          </button>
        )}
      </div>
      {showSaveName && onSaveBlock && (
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          <input
            autoFocus
            value={saveBlockName}
            onChange={e => setSaveBlockName(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && saveBlockName.trim()) { onSaveBlock(selectedElement, saveBlockName.trim()); setShowSaveName(false); setSaveBlockName(""); } if (e.key==="Escape") setShowSaveName(false); }}
            placeholder="Название блока..."
            style={{ flex:1, background:"rgba(15,22,48,0.7)", border:"1px solid rgba(99,139,255,0.3)", borderRadius:6, color:"var(--text-primary)", fontSize:11, padding:"4px 8px", outline:"none" }}
          />
          <button
            onClick={() => { if (saveBlockName.trim()) { onSaveBlock(selectedElement, saveBlockName.trim()); setShowSaveName(false); setSaveBlockName(""); } }}
            style={{ padding:"4px 10px", borderRadius:6, background:"#638bff", border:"none", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}
          >OK</button>
        </div>
      )}
      <div className="mb-2">
        <p className="font-semibold text-sm text-[var(--text-primary)]">
          <span className="text-blue-400">{selectedElement.type}</span>
        </p>
        <p className="text-[var(--text-muted)] text-[10px] mt-0.5">ID: {selectedElement.id.substring(0,8)}…</p>
      </div>
      <div className="space-y-3">
          {(isTextElement || selectedElement.type === "Header" || selectedElement.type === "Footer") && (selectedElement.type !== "Button" || (selectedElement.type === "Button" && selectedElement.content !== undefined)) && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-1">Содержимое</p>
              {selectedElement.type === "Header" || selectedElement.type === "Footer" || selectedElement.type === "Paragraph" ? (
                  <Textarea
                      id="elementContent"
                      value={selectedElement.content || ""}
                      onChange={handleContentChange}
                      placeholder={ selectedElement.type === "Header" || selectedElement.type === "Footer" ? "HTML содержимое" : "Текст параграфа"}
                      className="mt-1 text-xs"
                      rows={selectedElement.type === "Header" || selectedElement.type === "Footer" ? 6 : 3}
                  />
              ) : (
                  <Input
                      id="elementContent"
                      type="text"
                      value={selectedElement.content || ""}
                      onChange={handleContentChange}
                      placeholder={selectedElement.type.startsWith("Heading") ? "Текст заголовка" : "Текст кнопки"}
                      className="mt-1 text-xs h-8"
                  />
              )}
               {(selectedElement.type === "Header" || selectedElement.type === "Footer") && <p className="text-xs text-muted-foreground mt-1">Ссылки на страницы и название сайта обновляются автоматически. Изменяйте HTML здесь для полной кастомизации.</p>}
            </>
          )}

          {selectedElement.type === "Header" && onApplyHeaderStyle && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-2">Стиль шапки</p>
              <div className="grid grid-cols-2 gap-2">
                {HEADER_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyHeaderStyle(preset.id)}
                    className="rounded-lg overflow-hidden border transition-all hover:border-[rgba(99,139,255,0.6)]"
                    style={{
                      border: `1px solid rgba(99,139,255,${selectedElement.props?.headerStyleId === preset.id ? '0.7' : '0.2'})`,
                      background: 'rgba(15,22,48,0.4)',
                    }}
                    title={preset.name}
                  >
                    <div className="w-full overflow-hidden" style={{ height: '40px' }} dangerouslySetInnerHTML={{ __html: preset.previewHtml }} />
                    <div className="px-2 py-1.5 flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{preset.name}</span>
                      {selectedElement.props?.headerStyleId === preset.id && (
                        <span style={{ color: '#638bff', fontSize: '10px' }}>✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedElement.type === "Header" && (
            <>
                <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
                <p className="section-label mt-2 mb-1">Логотип и Название Сайта (Шапка)</p>
                <div>
                    <Label htmlFor="headerLogoUrl" className="text-xs">URL Логотипа (приоритет)</Label>
                    <Input
                        id="headerLogoUrl"
                        type="text"
                        value={selectedElement.props?.logoSrc || ""}
                        onChange={(e) => handlePropChange('logoSrc', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="mt-1 text-xs h-8"
                    />
                </div>
                 <div className="mt-2">
                    <Label htmlFor="predefinedLogoIcon" className="text-xs">Предустановленная иконка</Label>
                    <Select
                        value={selectedElement.props?.selectedLogoIconKey || ""}
                        onValueChange={(value) => handlePropChange('selectedLogoIconKey', value === "none" ? "" : value)}
                    >
                        <SelectTrigger id="predefinedLogoIcon" className="mt-1 text-xs h-8">
                            <SelectValue placeholder="Выбрать иконку..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none" className="text-xs">Нет (или SVG по умолчанию)</SelectItem>
                            {predefinedLogoIconKeys.map(iconKey => (
                                <SelectItem key={iconKey} value={iconKey} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <span dangerouslySetInnerHTML={{__html: PREDEFINED_LOGO_ICONS[iconKey].svgString.replace('<svg', '<svg class="h-4 w-4 text-foreground"') }} />
                                      {PREDEFINED_LOGO_ICONS[iconKey].name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Выбор URL очистит иконку, и наоборот.</p>
                </div>
                <div className="mt-2">
                  <Label htmlFor="headerIconColor" className="text-xs flex items-center"><Brush className="h-3 w-3 mr-1"/>Цвет иконки логотипа</Label>
                  <Input
                    id="headerIconColor"
                    type="color"
                    value={localHeaderIconColor}
                    onChange={(e) => handlePropChange('headerIconColor', e.target.value)}
                    className="h-8 w-full mt-1 p-0.5"
                  />
                </div>
                <div className="mt-2">
                  <Label htmlFor="headerSiteNameColor" className="text-xs flex items-center"><TypeIcon className="h-3 w-3 mr-1"/>Цвет текста названия сайта</Label>
                  <Input
                    id="headerSiteNameColor"
                    type="color"
                    value={localHeaderSiteNameColor}
                    onChange={(e) => handlePropChange('headerSiteNameColor', e.target.value)}
                    className="h-8 w-full mt-1 p-0.5"
                  />
                </div>
            </>
          )}

          {selectedElement.type === "Footer" && onApplyFooterStyle && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-2">Стиль подвала</p>
              <div className="grid grid-cols-2 gap-2">
                {FOOTER_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyFooterStyle(preset.id)}
                    className="rounded-lg overflow-hidden border transition-all hover:border-[rgba(99,139,255,0.6)]"
                    style={{
                      border: `1px solid rgba(99,139,255,${selectedElement.props?.footerStyleId === preset.id ? '0.7' : '0.2'})`,
                      background: 'rgba(15,22,48,0.4)',
                    }}
                    title={preset.name}
                  >
                    <div className="w-full overflow-hidden" style={{ height: '40px' }} dangerouslySetInnerHTML={{ __html: preset.previewHtml }} />
                    <div className="px-2 py-1.5 flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{preset.name}</span>
                      {selectedElement.props?.footerStyleId === preset.id && (
                        <span style={{ color: '#638bff', fontSize: '10px' }}>✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedElement.type === "Footer" && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-1">Текст копирайта (Подвал)</p>
              <div>
                  <Label htmlFor="footerCopyrightText" className="text-xs">Текст копирайта</Label>
                  <Textarea
                      id="footerCopyrightText"
                      value={selectedElement.props?.copyrightText || ""}
                      onChange={(e) => handlePropChange('copyrightText', e.target.value)}
                      placeholder={`&copy; ${new Date().getFullYear()} Название вашего сайта. Все права защищены.`}
                      className="mt-1 text-xs"
                      rows={3}
                  />
              </div>
            </>
          )}


          {selectedElement.type === "Button" && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-2">Ссылка кнопки</p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>URL</Label>
                  <Input
                    type="text"
                    placeholder="https://example.com или /page"
                    value={selectedElement.props?.href || ""}
                    onChange={e => onUpdateElementProp(selectedElement.id, 'href', e.target.value)}
                    className="mt-1 text-xs h-8"
                    style={{ background: 'rgba(15,22,48,0.6)', borderColor: 'rgba(99,139,255,0.25)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Открывать</Label>
                  <div className="flex gap-2 mt-1">
                    {[{ v: '_self', l: 'В этой вкладке' }, { v: '_blank', l: 'В новой вкладке' }].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => onUpdateElementProp(selectedElement.id, 'target', opt.v)}
                        style={{
                          flex: 1, padding: '5px 8px', borderRadius: 7, fontSize: 11,
                          border: `1px solid ${(selectedElement.props?.target || '_self') === opt.v ? 'rgba(99,139,255,0.6)' : 'rgba(99,139,255,0.2)'}`,
                          background: (selectedElement.props?.target || '_self') === opt.v ? 'rgba(99,139,255,0.18)' : 'rgba(15,22,48,0.4)',
                          color: (selectedElement.props?.target || '_self') === opt.v ? '#638bff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-[rgba(99,139,255,0.15)] my-2" />
              <p className="section-label mt-1 mb-2">Hover-анимация</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: '', label: 'Нет' },
                  { id: 'btn-hover-scale', label: '⬡ Масштаб' },
                  { id: 'btn-hover-lift', label: '↑ Подъём' },
                  { id: 'btn-hover-glow', label: '✦ Свечение' },
                  { id: 'btn-hover-slide', label: '▶ Слайд' },
                  { id: 'btn-hover-shimmer', label: '✧ Блеск' },
                  { id: 'btn-hover-border', label: '▭ Рамка' },
                  { id: 'btn-hover-pulse', label: '○ Пульс' },
                  { id: 'btn-hover-bounce', label: '◎ Bounce' },
                ].map(anim => {
                  const cur = selectedElement.props?.hoverAnimation || '';
                  const active = cur === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => onUpdateElementProp(selectedElement.id, 'hoverAnimation', anim.id)}
                      style={{
                        padding: '6px 4px', borderRadius: 7, fontSize: 10, fontWeight: 500,
                        border: `1px solid ${active ? 'rgba(99,139,255,0.6)' : 'rgba(99,139,255,0.18)'}`,
                        background: active ? 'rgba(99,139,255,0.18)' : 'rgba(15,22,48,0.4)',
                        color: active ? '#638bff' : 'var(--text-secondary)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                      }}
                    >{anim.label}</button>
                  );
                })}
              </div>
            </>
          )}

          <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
          <p className="section-label mt-2 mb-1">Размеры и Отступы</p>
          <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width" className="text-xs">Ширина</Label>
                <Input id="width" type="text" value={getCurrentValue(effectiveStyles, 'width', 'auto')} onChange={(e) => handleStyleChange('width', e.target.value)} placeholder="Авто" className="mt-1 text-xs h-8" />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs">Высота</Label>
                <Input id="height" type="text" value={getCurrentValue(effectiveStyles, 'height', 'auto')} onChange={(e) => handleStyleChange('height', e.target.value)} placeholder="Авто" className="mt-1 text-xs h-8" />
              </div>
          </div>
          <div>
            <Label htmlFor="padding" className="text-xs">Внутр. отступ</Label>
            <Input id="padding" type="text" value={getCurrentValue(effectiveStyles, 'padding', '')} onChange={(e) => handleStyleChange('padding', e.target.value)} placeholder="0" className="mt-1 text-xs h-8" />
          </div>
          <div>
            <Label htmlFor="margin" className="text-xs">Внеш. отступ</Label>
            <Input id="margin" type="text" value={getCurrentValue(effectiveStyles, 'margin', '')} onChange={(e) => handleStyleChange('margin', e.target.value)} placeholder="0" className="mt-1 text-xs h-8" />
          </div>

          <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
          <p className="section-label mt-2 mb-1">Оформление (Элемент)</p>

          {isStylableBackgroundElement && (
            <>
              <Label className="text-xs font-medium">Тип фона</Label>
              <RadioGroup
                value={backgroundType}
                onValueChange={(value) => handleBackgroundTypeChange(value as BackgroundType)}
                className="flex space-x-2 mt-1 mb-2"
                disabled={!allowsGradientBackground && backgroundType === "gradient"}
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="solid" id={`el-bg-${selectedElement.id}-solid`} />
                  <Label htmlFor={`el-bg-${selectedElement.id}-solid`} className="text-xs"><Palette className="inline h-3 w-3 mr-1"/>Сплошной</Label>
                </div>
                {allowsGradientBackground && (
                    <div className="flex items-center space-x-1">
                    <RadioGroupItem value="gradient" id={`el-bg-${selectedElement.id}-gradient`} />
                    <Label htmlFor={`el-bg-${selectedElement.id}-gradient`} className="text-xs"><Droplets className="inline h-3 w-3 mr-1"/>Градиент</Label>
                    </div>
                )}
              </RadioGroup>

              {backgroundType === "solid" && (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="elementSolidBgColor" className="text-xs">Цвет фона</Label>
                    <Input
                      id="elementSolidBgColor"
                      type="color"
                      value={isValidHexColor(localElementSolidBgColor) ? localElementSolidBgColor : '#ffffff'} 
                      onChange={handleSolidBackgroundColorChange}
                      className="h-8 w-full mt-1 p-0.5"
                    />
                  </div>
                  {selectedElement.type === "Header" && ( 
                    <div>
                      <Label htmlFor="elementSolidBgOpacity" className="text-xs">Прозрачность фона ({localElementSolidBgOpacity}%)</Label>
                      <Slider
                        id="elementSolidBgOpacity"
                        min={0}
                        max={100}
                        step={1}
                        value={[localElementSolidBgOpacity]}
                        onValueChange={handleSolidBackgroundOpacityChange}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {backgroundType === "gradient" && allowsGradientBackground && (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="gradientColor1" className="text-xs">Цвет 1</Label>
                    <Input
                      id="gradientColor1"
                      type="color"
                      value={localGradientColor1}
                      onChange={(e) => { setLocalGradientColor1(e.target.value); if (selectedElement) { const b = getBaseStylesWithoutBackground(effectiveStyles); onUpdateElementStyle(selectedElement.id, { ...b, background: `linear-gradient(${localGradientAngle}deg, ${e.target.value}, ${localGradientColor2})` }); } }}
                      className="h-8 w-full mt-1 p-0.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradientColor2" className="text-xs">Цвет 2</Label>
                    <Input
                      id="gradientColor2"
                      type="color"
                      value={localGradientColor2}
                      onChange={(e) => { setLocalGradientColor2(e.target.value); if (selectedElement) { const b = getBaseStylesWithoutBackground(effectiveStyles); onUpdateElementStyle(selectedElement.id, { ...b, background: `linear-gradient(${localGradientAngle}deg, ${localGradientColor1}, ${e.target.value})` }); } }}
                      className="h-8 w-full mt-1 p-0.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradientAngle" className="text-xs">Угол (deg)</Label>
                    <Input
                      id="gradientAngle"
                      type="number"
                      value={localGradientAngle}
                      onChange={(e) => { setLocalGradientAngle(e.target.value); if (selectedElement) { const b = getBaseStylesWithoutBackground(effectiveStyles); onUpdateElementStyle(selectedElement.id, { ...b, background: `linear-gradient(${e.target.value}deg, ${localGradientColor1}, ${localGradientColor2})` }); } }}
                      placeholder="90"
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                </div>
              )}
            </>
          )}


          <div>
            <Label htmlFor="elementBorderRadius" className="text-xs">Скругление углов</Label>
            <Input id="elementBorderRadius" type="text" value={getCurrentValue(effectiveStyles, 'borderRadius', '0')} onChange={(e) => handleStyleChange('borderRadius', e.target.value)} placeholder="0" className="mt-1 text-xs h-8" />
          </div>
          <div>
            <Label htmlFor="elementBorderFull" className="text-xs">Граница</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                  id="elementBorder"
                  type="text"
                  value={getCurrentValue(effectiveStyles, 'border', '')}
                  onChange={(e) => {
                      const newBorderValue = e.target.value;
                      const colorMatch = newBorderValue.match(/#(?:[0-9a-fA-F]{3}){1,2}\b|rgba?\([^)]+\)|hsla?\([^)]+\)/i);
                      if (colorMatch && (isValidHexColor(colorMatch[0]) || isRgbOrRgbaColor(colorMatch[0]) || isHslOrHslaColor(colorMatch[0]))) {
                          setLocalElementBorderColor(colorMatch[0]);
                      } else if (newBorderValue.trim() === "") {
                          setLocalElementBorderColor(effectiveStyles?.borderColor?.toString() || '#000000');
                      }
                      handleStyleChange('border', newBorderValue);
                  }}
                  placeholder="Напр. 1px solid #000"
                  className="flex-grow text-xs h-8"
                />
              <Input
                  id="elementBorderColorPicker"
                  type="color"
                  value={isValidHexColor(localElementBorderColor) ? localElementBorderColor : '#000000'}
                  onChange={(e) => {
                      const newColor = e.target.value;
                      setLocalElementBorderColor(newColor);
                      const currentBorder = effectiveStyles?.border?.toString() || '1px solid';
                      const parts = currentBorder.split(' ');
                      const borderWidth = parts[0] && parts[0].match(/^\d*(\.\d+)?(px|em|rem|%|vw|vh|cm|mm|in|pt|pc|auto|inherit|initial|unset)$/i) ? parts[0] : '1px';
                      const borderStyle = parts[1] && ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'].includes(parts[1].toLowerCase()) ? parts[1] : 'solid';
                      handleStyleChange('border', `${borderWidth} ${borderStyle} ${newColor}`);
                  }}
                  className="h-8 w-10 p-0.5"
                  title="Выбрать цвет границы элемента"
              />
            </div>
          </div>

          {isTextElement && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-1">Текст</p>
               <div>
                <Label htmlFor="textAlign" className="text-xs">Выравнивание текста</Label>
                <Select
                  value={effectiveStyles?.textAlign?.toString() || "left"}
                  onValueChange={(value) => handleStyleChange('textAlign', value)}
                >
                  <SelectTrigger id="textAlign" className="mt-1 text-xs h-8">
                    <SelectValue placeholder="Выравнивание" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left" className="text-xs">По левому краю</SelectItem>
                    <SelectItem value="center" className="text-xs">По центру</SelectItem>
                    <SelectItem value="right" className="text-xs">По правому краю</SelectItem>
                    <SelectItem value="justify" className="text-xs">По ширине</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="elementTextColor" className="text-xs">Цвет текста</Label>
                <Input
                  id="elementTextColor"
                  type="color"
                  value={isValidHexColor(localElementTextColor) ? localElementTextColor : '#000000'}
                  onChange={(e) => {
                    setLocalElementTextColor(e.target.value);
                    handleStyleChange('color', e.target.value);
                  }}
                  className="h-8 w-full mt-1 p-0.5"
                />
              </div>
              <div>
                <Label htmlFor="elementFontSize" className="text-xs">Размер шрифта</Label>
                <Input id="elementFontSize" type="text" value={getCurrentValue(effectiveStyles, 'fontSize', '')} onChange={(e) => handleStyleChange('fontSize', e.target.value)} placeholder="Напр. 16" className="mt-1 text-xs h-8" />
              </div>
              <div>
                <Label htmlFor="elementFontFamily" className="text-xs">Шрифт</Label>
                <Select
                  value={effectiveStyles?.fontFamily?.toString() || FONT_FAMILIES[0].value}
                  onValueChange={(value) => handleStyleChange('fontFamily', value)}
                >
                  <SelectTrigger id="elementFontFamily" className="mt-1 text-xs h-8">
                    <SelectValue placeholder="Выберите шрифт" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map(font => (
                      <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }} className="text-xs">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedElement.type === "Image" && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-1">Изображение</p>
              {onEditImage && (
                  <Button onClick={onEditImage} variant="outline" className="w-full mt-1 mb-2 text-xs h-8">
                      <ImageIconProp className="mr-2 h-3.5 w-3.5" /> Изменить URL/Источник
                  </Button>
              )}
              <div>
                <Label htmlFor="imageSrcDisplay" className="text-xs">Источник (URL)</Label>
                <Input id="imageSrcDisplay" type="text" value={selectedElement.src || ""} readOnly className="mt-1 bg-muted text-xs h-8" />
              </div>
              <div>
                <Label htmlFor="imageAlt" className="text-xs">Alt текст</Label>
                <Input id="imageAlt" type="text" value={selectedElement.alt || ""} onChange={(e) => handlePropChange('alt', e.target.value)} placeholder="Описание изображения" className="mt-1 text-xs h-8" />
              </div>
              <div>
                <Label htmlFor="dataAiHint" className="text-xs">Подсказка для ИИ (макс 2 слова)</Label>
                <Input 
                    id="dataAiHint" 
                    type="text" 
                    value={selectedElement.props?.['data-ai-hint'] || ""} 
                    onChange={(e) => handlePropChange('data-ai-hint', e.target.value)} 
                    placeholder="Напр. природа горы" 
                    className="mt-1 text-xs h-8" 
                />
              </div>
              <div>
                <Label htmlFor="objectFit" className="text-xs">Заполнение объекта</Label>
                <Select value={effectiveStyles?.objectFit?.toString() || "cover"} onValueChange={(value) => handleStyleChange('objectFit', value as any)}>
                  <SelectTrigger id="objectFit" className="mt-1 text-xs h-8"><SelectValue placeholder="Выберите тип заполнения" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="fill" className="text-xs">Fill (Заполнить)</SelectItem>
                      <SelectItem value="contain" className="text-xs">Contain (Сохранить пропорции, вместить)</SelectItem>
                      <SelectItem value="cover" className="text-xs">Cover (Сохранить пропорции, обрезать)</SelectItem>
                      <SelectItem value="none" className="text-xs">None (Без масштабирования)</SelectItem>
                      <SelectItem value="scale-down" className="text-xs">Scale Down (Уменьшить до размера контейнера)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rotate" className="text-xs">Поворот (градусы)</Label>
                <Input id="rotate" type="number" value={getCurrentValue(effectiveStyles, 'rotate', '0')} onChange={(e) => handleStyleChange('rotate', e.target.value)} placeholder="0" className="mt-1 text-xs h-8"/>
              </div>
            </>
          )}
          {selectedElement.type === "Container" && (
            <>
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
              <p className="section-label mt-2 mb-1 flex items-center">
                <PlusCircle className="mr-1.5 h-3 w-3 text-blue-400" />
                Добавить в контейнер
              </p>
              <div className="space-y-2 mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs justify-start gap-2 h-8"
                    >
                        <Heading1 className="h-3.5 w-3.5" />Добавить Заголовок
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[calc(theme(space.80)-1.25rem)]">
                    <DropdownMenuItem onClick={() => onAddChildElement('Heading1')} className="text-xs gap-2 h-8">
                        <Heading1 className="h-3.5 w-3.5" /> Заголовок H1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddChildElement('Heading2')} className="text-xs gap-2 h-8">
                        <Heading2 className="h-3.5 w-3.5" /> Заголовок H2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddChildElement('Heading3')} className="text-xs gap-2 h-8">
                        <Heading3 className="h-3.5 w-3.5" /> Заголовок H3
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                    onClick={() => onAddChildElement('Paragraph')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs justify-start gap-2 h-8"
                >
                    <List className="h-3.5 w-3.5" />Добавить Параграф
                </Button>
                <Button 
                    onClick={() => onAddChildElement('Button')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs justify-start gap-2 h-8"
                >
                    <PlusCircle className="h-3.5 w-3.5" />Добавить Кнопку
                </Button>
                 <Button 
                    onClick={() => onOpenImageDialogForContainer()} 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs justify-start gap-2 h-8"
                >
                    <ImageIconProp className="h-3.5 w-3.5" />Добавить Изображение
                </Button>
              </div>
              {/* ─── ANIMATION SECTION ─── */}
              <div className="h-px bg-[rgba(99,139,255,0.15)] my-2" />
              <p className="section-label mt-2 mb-2">Анимация при появлении</p>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { id: '', label: 'Нет' },
                  { id: 'pmi-fadeIn 0.6s ease both', label: 'Fade' },
                  { id: 'pmi-fadeInUp 0.6s ease both', label: '↑ Up' },
                  { id: 'pmi-fadeInDown 0.6s ease both', label: '↓ Down' },
                  { id: 'pmi-fadeInLeft 0.6s ease both', label: '← Left' },
                  { id: 'pmi-fadeInRight 0.6s ease both', label: '→ Right' },
                  { id: 'pmi-zoomIn 0.5s ease both', label: 'Zoom' },
                  { id: 'pmi-bounceIn 0.8s ease both', label: 'Bounce' },
                  { id: 'pmi-flipInX 0.6s ease both', label: 'Flip' },
                  { id: 'pmi-slideInLeft 0.5s ease both', label: 'Slide←' },
                  { id: 'pmi-pulse 1.5s ease infinite', label: 'Pulse' },
                  { id: 'pmi-float 3s ease-in-out infinite', label: 'Float' },
                ].map(anim => {
                  const current = (effectiveStyles?.animation as string) || '';
                  const isActive = anim.id === '' ? !current : current.startsWith(anim.id.split(' ')[0]);
                  return (
                    <button
                      key={anim.id}
                      onClick={() => {
                        const baseStyles = { ...effectiveStyles };
                        if (anim.id) { (baseStyles as any).animation = anim.id; }
                        else { delete (baseStyles as any).animation; }
                        onUpdateElementStyle(selectedElement.id, baseStyles as CSSProperties);
                      }}
                      style={{
                        padding: '5px 4px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 500,
                        border: `1px solid ${isActive ? 'rgba(99,139,255,0.6)' : 'rgba(99,139,255,0.18)'}`,
                        background: isActive ? 'rgba(99,139,255,0.18)' : 'rgba(15,22,48,0.4)',
                        color: isActive ? '#638bff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'center',
                      }}
                    >
                      {anim.label}
                    </button>
                  );
                })}
              </div>
              {(effectiveStyles?.animation as string) && (
                <div>
                  <Label className="text-xs">Длительность (сек)</Label>
                  <input
                    type="range" min="0.2" max="3" step="0.1"
                    value={parseFloat(((effectiveStyles?.animation as string) || '0.6s').match(/[\d.]+s/)?.[0] || '0.6')}
                    onChange={e => {
                      const parts = ((effectiveStyles?.animation as string) || '').split(' ');
                      if (parts.length >= 2) { parts[1] = `${e.target.value}s`; }
                      onUpdateElementStyle(selectedElement.id, { ...effectiveStyles, animation: parts.join(' ') } as CSSProperties);
                    }}
                    className="w-full mt-1 accent-[#638bff]"
                  />
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}