
"use client";

import type { CanvasElement, ElementType } from "@/types/canvas-element";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CSSProperties } from "react";
import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Settings2, ImageUp as ImageIconProp, Palette, Droplets, List, Type as TypeIcon, Brush, PlusCircle, Heading1, Heading2, Heading3 } from "lucide-react"; 
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
  { label: "Inter (по умолч.)", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif" },
  { label: "Courier New", value: "Courier New, Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "Open Sans, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
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
}

export default function PropertyInspectorPanel({
  selectedElement,
  onUpdateElementStyle,
  onUpdateElementContent,
  onUpdateElementProp,
  onEditImage,
  onAddChildElement,
  onOpenImageDialogForContainer,
}: PropertyInspectorPanelProps) {

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

    const styles = selectedElement.styles || {};
    let determinedNewBackgroundType: BackgroundType = "solid";

    if ((selectedElement.type === "Header" || selectedElement.type === "Footer" || selectedElement.type === "Container") && 
        styles.background && typeof styles.background === 'string' &&
        styles.background.startsWith('linear-gradient')) {
        determinedNewBackgroundType = "gradient";
    }
    
    if (backgroundType !== determinedNewBackgroundType) {
        setBackgroundType(determinedNewBackgroundType);
    }
    
    if (determinedNewBackgroundType === "gradient") {
        const gradientMatch = styles.background?.match(/linear-gradient\(([^,]+deg),\s*([^,]+),\s*([^)]+)\)/);
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
    
    const currentBorderColor = getCurrentValue(styles, 'borderColorForPicker', '#000000');
    if (localElementBorderColor !== currentBorderColor) setLocalElementBorderColor(currentBorderColor);

    if (["Heading1", "Heading2", "Heading3", "Paragraph", "Button"].includes(selectedElement.type)) {
        const currentTextColor = getCurrentValue(styles, 'color', 'hsl(var(--foreground))');
        if (localElementTextColor !== currentTextColor) setLocalElementTextColor(currentTextColor);
    }

    if (selectedElement.type === "Header") {
      const newHeaderIconColor = selectedElement.props?.headerIconColor || "hsl(var(--primary))";
      const newHeaderSiteNameColor = selectedElement.props?.headerSiteNameColor || "hsl(var(--foreground))";
      if (localHeaderIconColor !== newHeaderIconColor) setLocalHeaderIconColor(newHeaderIconColor);
      if (localHeaderSiteNameColor !== newHeaderSiteNameColor) setLocalHeaderSiteNameColor(newHeaderSiteNameColor);
    }

  }, [selectedElement, getCurrentValue, backgroundType]);


  const handleBackgroundTypeChange = (newType: BackgroundType) => {
    if (!selectedElement || (selectedElement.type !== "Header" && selectedElement.type !== "Footer" && selectedElement.type !== "Container")) return;
    
    setBackgroundType(newType); 

    const baseStyles = getBaseStylesWithoutBackground(selectedElement.styles);
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

    const baseStyles = getBaseStylesWithoutBackground(selectedElement.styles);
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
      
      const baseStyles = getBaseStylesWithoutBackground(selectedElement.styles);
      let newCompleteStyles: CSSProperties = { ...baseStyles };
      newCompleteStyles.backgroundColor = hexToRgba(localElementSolidBgColor, newOpacity);
      onUpdateElementStyle(selectedElement.id, newCompleteStyles);
  };

 const applyGradientChange = useCallback(() => {
    if (!selectedElement || backgroundType !== 'gradient' || (selectedElement.type !== "Header" && selectedElement.type !== "Footer" && selectedElement.type !== "Container")) return;
    
    const baseStyles = getBaseStylesWithoutBackground(selectedElement.styles);
    const newGradientStyle = `linear-gradient(${localGradientAngle}deg, ${localGradientColor1}, ${localGradientColor2})`;

    if (selectedElement.styles?.background !== newGradientStyle) {
      const newCompleteStyles: CSSProperties = { 
        ...baseStyles,
        background: newGradientStyle
      };
      onUpdateElementStyle(selectedElement.id, newCompleteStyles);
    }
  }, [selectedElement, backgroundType, localGradientAngle, localGradientColor1, localGradientColor2, onUpdateElementStyle]);


  useEffect(() => {
    if (backgroundType === 'gradient' && selectedElement && (selectedElement.type === "Header" || selectedElement.type === "Footer" || selectedElement.type === "Container")) {
        applyGradientChange();
    }
  }, [localGradientColor1, localGradientColor2, localGradientAngle, backgroundType, selectedElement, applyGradientChange]);


  const handleStyleChange = (property: keyof CSSProperties, value: string | number) => {
    if (!selectedElement) return;

    let processedValue: string | number | undefined = value;
    let isDeletingProperty = false;

    const numericPropsWithoutUnit = ['opacity', 'zIndex', 'fontWeight']; 
    const lengthProps = ['fontSize', 'width', 'height', 'minHeight', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'borderRadius', 'borderWidth', 'letterSpacing', 'lineHeight'];
    
    let currentStyles = selectedElement.styles || {};
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
    } else if (value === undefined || (typeof value === 'string' && value.trim() === "")) {
        isDeletingProperty = true;
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
    
    const baseWithoutAnyBackground = getBaseStylesWithoutBackground(newCompleteStyles);

    if (selectedElement.type === "Header" || selectedElement.type === "Footer" || selectedElement.type === "Container") {
        if (backgroundType === "solid") {
            if (selectedElement.type === "Header") { 
                 newCompleteStyles = { ...baseWithoutAnyBackground, backgroundColor: hexToRgba(localElementSolidBgColor, localElementSolidBgOpacity) };
            } else { 
                 newCompleteStyles = { ...baseWithoutAnyBackground, backgroundColor: localElementSolidBgColor };
            }
        } else { 
            newCompleteStyles = { ...baseWithoutAnyBackground, background: `linear-gradient(${localGradientAngle}deg, ${localGradientColor1}, ${localGradientColor2})` };
        }
    } else if (selectedElement.type !== "Image"){ 
         newCompleteStyles = { ...baseWithoutAnyBackground, backgroundColor: localElementSolidBgColor }; 
    } else { 
        newCompleteStyles = { ...newCompleteStyles };
    }


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
      <div className="p-4">
        <CardHeader className="pb-2 pt-0 px-0">
          <CardTitle className="font-headline text-base flex items-center">
            <Settings2 className="h-5 w-5 mr-2 text-muted-foreground" /> Свойства элемента
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex flex-col items-center justify-center text-center h-full min-h-48 p-4">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
                Выберите элемент на холсте, чтобы изменить его свойства.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
                Свойства холста (фон, сетка) настраиваются в левой панели на вкладке "Холст".
            </p>
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <CardHeader className="pb-2 pt-0 px-0">
        <CardTitle className="font-headline text-base">Свойства: <span className="text-primary font-semibold">{selectedElement.type}</span></CardTitle>
        <CardDescription className="text-xs">ID: {selectedElement.id.substring(0,8)}...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-2 text-xs px-0">
          {(isTextElement || selectedElement.type === "Header" || selectedElement.type === "Footer") && (selectedElement.type !== "Button" || (selectedElement.type === "Button" && selectedElement.content !== undefined)) && (
            <>
              <Separator />
              <h4 className="text-xs font-medium pt-1">Содержимое</h4>
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

          {selectedElement.type === "Header" && (
            <>
                <Separator />
                <h4 className="text-xs font-medium pt-1">Логотип и Название Сайта (Шапка)</h4>
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

          {selectedElement.type === "Footer" && (
            <>
              <Separator />
              <h4 className="text-xs font-medium pt-1">Текст копирайта (Подвал)</h4>
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


          <Separator />
          <h4 className="text-xs font-medium pt-1">Размеры и Отступы</h4>
          <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width" className="text-xs">Ширина</Label>
                <Input id="width" type="text" value={getCurrentValue(selectedElement.styles, 'width', 'auto')} onChange={(e) => handleStyleChange('width', e.target.value)} placeholder="Авто" className="mt-1 text-xs h-8" />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs">Высота</Label>
                <Input id="height" type="text" value={getCurrentValue(selectedElement.styles, 'height', 'auto')} onChange={(e) => handleStyleChange('height', e.target.value)} placeholder="Авто" className="mt-1 text-xs h-8" />
              </div>
          </div>
          <div>
            <Label htmlFor="padding" className="text-xs">Внутр. отступ</Label>
            <Input id="padding" type="text" value={getCurrentValue(selectedElement.styles, 'padding', '')} onChange={(e) => handleStyleChange('padding', e.target.value)} placeholder="0" className="mt-1 text-xs h-8" />
          </div>
          <div>
            <Label htmlFor="margin" className="text-xs">Внеш. отступ</Label>
            <Input id="margin" type="text" value={getCurrentValue(selectedElement.styles, 'margin', '')} onChange={(e) => handleStyleChange('margin', e.target.value)} placeholder="0" className="mt-1 text-xs h-8" />
          </div>

          <Separator />
          <h4 className="text-xs font-medium pt-1">Оформление (Элемент)</h4>

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
                      onChange={(e) => setLocalGradientColor1(e.target.value)}
                      className="h-8 w-full mt-1 p-0.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradientColor2" className="text-xs">Цвет 2</Label>
                    <Input
                      id="gradientColor2"
                      type="color"
                      value={localGradientColor2}
                      onChange={(e) => setLocalGradientColor2(e.target.value)}
                      className="h-8 w-full mt-1 p-0.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradientAngle" className="text-xs">Угол (deg)</Label>
                    <Input
                      id="gradientAngle"
                      type="number"
                      value={localGradientAngle}
                      onChange={(e) => setLocalGradientAngle(e.target.value)}
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
            <Input id="elementBorderRadius" type="text" value={getCurrentValue(selectedElement.styles, 'borderRadius', '0')} onChange={(e) => handleStyleChange('borderRadius', e.target.value)} placeholder="0" className="mt-1 text-xs h-8" />
          </div>
          <div>
            <Label htmlFor="elementBorderFull" className="text-xs">Граница</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                  id="elementBorder"
                  type="text"
                  value={getCurrentValue(selectedElement.styles, 'border', '')}
                  onChange={(e) => {
                      const newBorderValue = e.target.value;
                      const colorMatch = newBorderValue.match(/#(?:[0-9a-fA-F]{3}){1,2}\b|rgba?\([^)]+\)|hsla?\([^)]+\)/i);
                      if (colorMatch && (isValidHexColor(colorMatch[0]) || isRgbOrRgbaColor(colorMatch[0]) || isHslOrHslaColor(colorMatch[0]))) {
                          setLocalElementBorderColor(colorMatch[0]);
                      } else if (newBorderValue.trim() === "") {
                          setLocalElementBorderColor(selectedElement.styles?.borderColor?.toString() || '#000000');
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
                      const currentBorder = selectedElement.styles?.border?.toString() || '1px solid';
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
              <Separator />
              <h4 className="text-xs font-medium pt-1">Текст</h4>
               <div>
                <Label htmlFor="textAlign" className="text-xs">Выравнивание текста</Label>
                <Select
                  value={selectedElement.styles?.textAlign?.toString() || "left"}
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
                <Input id="elementFontSize" type="text" value={getCurrentValue(selectedElement.styles, 'fontSize', '')} onChange={(e) => handleStyleChange('fontSize', e.target.value)} placeholder="Напр. 16" className="mt-1 text-xs h-8" />
              </div>
              <div>
                <Label htmlFor="elementFontFamily" className="text-xs">Шрифт</Label>
                <Select
                  value={selectedElement.styles?.fontFamily?.toString() || FONT_FAMILIES[0].value}
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
              <Separator />
              <h4 className="text-xs font-medium pt-1">Изображение</h4>
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
                <Select value={selectedElement.styles?.objectFit?.toString() || "cover"} onValueChange={(value) => handleStyleChange('objectFit', value as any)}>
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
                <Input id="rotate" type="number" value={getCurrentValue(selectedElement.styles, 'rotate', '0')} onChange={(e) => handleStyleChange('rotate', e.target.value)} placeholder="0" className="mt-1 text-xs h-8"/>
              </div>
            </>
          )}
          {selectedElement.type === "Container" && (
            <>
              <Separator />
              <h4 className="text-xs font-medium pt-1 flex items-center">
                <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                Добавить в контейнер
              </h4>
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
                  <DropdownMenuContent className="w-[calc(theme(space.80)-1.25rem)]"> {/* Match width of trigger approximately */}
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
               {selectedElement.children && selectedElement.children.length > 0 && (
                <>
                  <Separator className="my-3"/>
                  <h5 className="text-xs font-medium">Дочерние элементы ({selectedElement.children.length}):</h5>
                  <p className="text-xs text-muted-foreground italic">
                    (Управление дочерними элементами появится здесь в будущем)
                  </p>
                </>
              )}
            </>
          )}
        </CardContent>
    </div>
  );
}

    