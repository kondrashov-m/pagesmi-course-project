"use client";

import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { SitePage } from "@/types/canvas-element";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Droplets } from "lucide-react"; 

const isValidHexColor = (color: string): boolean => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color);
const isRgbOrRgbaColor = (color: string): boolean => /^rgba?\([\s\d%,.-]+\)$/.test(color);

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


interface CanvasPropertyPanelProps {
  canvasStyles: CSSProperties;
  onUpdateCanvasStyles: (newStyles: Partial<CSSProperties>) => void;
  gridSettings?: SitePage['gridSettings'];
  onUpdateGridSettings: (show: boolean, size?: string, type?: string, columns?: string, columnGutter?: string) => void;
}

const INTERNAL_DEFAULT_GRID_SETTINGS: SitePage['gridSettings'] = { showGrid: false, gridSize: "20", gridType: 'dots', columns: '12', columnGutter: '16' };

export default function CanvasPropertyPanel({
  canvasStyles,
  onUpdateCanvasStyles,
  gridSettings: gridSettingsProp,
  onUpdateGridSettings,
}: CanvasPropertyPanelProps) {

  const gridSettings: SitePage['gridSettings'] = gridSettingsProp || INTERNAL_DEFAULT_GRID_SETTINGS;

  type BackgroundType = "solid" | "gradient";
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("solid");
  
  const [localCanvasSolidBgColor, setLocalCanvasSolidBgColor] = useState("#FFFFFF");
  const [localCanvasSolidBgOpacity, setLocalCanvasSolidBgOpacity] = useState(100); 

  const [localGradientColor1, setLocalGradientColor1] = useState("#FF0000");
  const [localGradientColor2, setLocalGradientColor2] = useState("#0000FF");
  const [localGradientAngle, setLocalGradientAngle] = useState("90");

  useEffect(() => {
    let determinedNewBackgroundType: BackgroundType = "solid";
    if (canvasStyles.background && typeof canvasStyles.background === 'string' && canvasStyles.background.startsWith('linear-gradient')) {
      determinedNewBackgroundType = "gradient";
    }
    
    if (backgroundType !== determinedNewBackgroundType) {
        setBackgroundType(determinedNewBackgroundType);
    }
    
    if (determinedNewBackgroundType === "gradient" && canvasStyles.background && typeof canvasStyles.background === 'string') {
        const gradientMatch = canvasStyles.background.match(/linear-gradient\(([^,]+deg),\s*([^,]+),\s*([^)]+)\)/);
        const newAngle = gradientMatch ? gradientMatch[1].replace('deg', '').trim() : "90";
        const newColor1 = gradientMatch ? gradientMatch[2].trim() : "#FF0000";
        const newColor2 = gradientMatch ? gradientMatch[3].trim() : "#0000FF";

        if (localGradientAngle !== newAngle) setLocalGradientAngle(newAngle);
        if (localGradientColor1 !== newColor1) setLocalGradientColor1(newColor1);
        if (localGradientColor2 !== newColor2) setLocalGradientColor2(newColor2);
        
        if (localCanvasSolidBgColor !== '#FFFFFF') setLocalCanvasSolidBgColor('#FFFFFF');
        if (localCanvasSolidBgOpacity !== 100) setLocalCanvasSolidBgOpacity(100); 

    } else { 
        let solidColor = '#FFFFFF';
        if (typeof canvasStyles.backgroundColor === 'string' && isRgbOrRgbaColor(canvasStyles.backgroundColor)) {
            const parsed = parseRgba(canvasStyles.backgroundColor);
            solidColor = parsed.color;
        } else if (typeof canvasStyles.backgroundColor === 'string' && isValidHexColor(canvasStyles.backgroundColor)) {
            solidColor = canvasStyles.backgroundColor;
        } else if (typeof canvasStyles.backgroundColor === 'string' && canvasStyles.backgroundColor.startsWith('hsl(var(--))') ) { 
             solidColor = '#FFFFFF'; 
        } else {
            solidColor = "#FFFFFF"; 
        }
        
        if (localCanvasSolidBgColor !== solidColor) setLocalCanvasSolidBgColor(solidColor);
        
        if (localGradientAngle !== "90") setLocalGradientAngle("90");
        if (localGradientColor1 !== "#FF0000") setLocalGradientColor1("#FF0000");
        if (localGradientColor2 !== "#0000FF") setLocalGradientColor2("#0000FF");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasStyles.background, canvasStyles.backgroundColor]);

  const handleBackgroundTypeChangeInternal = (newType: BackgroundType) => {
    setBackgroundType(newType);
    let newCanvasStyles: Partial<CSSProperties> = {};
    if (newType === "solid") {
      newCanvasStyles = { backgroundColor: localCanvasSolidBgColor, background: undefined };
    } else {
      newCanvasStyles = { background: `linear-gradient(${localGradientAngle}deg, ${localGradientColor1}, ${localGradientColor2})`, backgroundColor: undefined };
    }
    onUpdateCanvasStyles(newCanvasStyles);
  };

  const handleSolidBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setLocalCanvasSolidBgColor(color);
    if (backgroundType === "solid") {
      onUpdateCanvasStyles({ backgroundColor: color, background: undefined });
    }
  };
  
  const applyGradientToCanvas = (color1: string, color2: string, angle: string) => {
    onUpdateCanvasStyles({
      background: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
      backgroundColor: undefined,
    });
  };


  const handleCanvasStyleChange = (property: keyof CSSProperties, value: string) => {
    let processedValue: string | number | undefined = value;
     if (property === 'width' || property === 'padding') { 
        if (value && value.trim() !== "" && !isNaN(Number(value)) && !value.match(/%|auto|rem|em|vh|vw|px/i) && value.trim() !== '0') {
            processedValue = `${value}px`;
        } else if (value.trim() === "") {
            processedValue = undefined;
        }
    }
    onUpdateCanvasStyles({ [property]: processedValue });
  };

  const getCurrentCanvasValue = (property: keyof CSSProperties, defaultValue: string = ""): string => {
    const currentValue = canvasStyles[property];
     if (property === 'width' || property === 'padding') { 
        if (typeof currentValue === 'string') {
            if (currentValue === '0px' || currentValue === '0') return '0';
            if (currentValue.match(/%|auto|rem|em|vh|vw|ch|ex|vmin|vmax|min-content|max-content|fit-content|calc\(|var\(/i)) {
                 return currentValue;
            }
            if (currentValue.endsWith('px')) {
                return currentValue.replace('px', '');
            }
            return currentValue;
        }
        if (typeof currentValue === 'number') return currentValue.toString();
    }
    return typeof currentValue === 'string' ? currentValue : defaultValue;
  };


  return (
    <div className="space-y-3 text-xs p-4"> 
      <div className="mb-3">
        <p className="font-semibold text-sm text-[var(--text-primary)]">Свойства Холста</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Фон, сетка и размеры текущей страницы.</p>
      </div>

    
      

      <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
      <p className="section-label mt-2 mb-1">Фон Холста</p>
      <RadioGroup
        value={backgroundType}
        onValueChange={(value) => handleBackgroundTypeChangeInternal(value as BackgroundType)}
        className="flex space-x-2 mt-1 mb-2"
      >
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="solid" id="canvas-bg-solid" />
          <Label htmlFor="canvas-bg-solid" className="text-xs"><Palette className="inline h-3 w-3 mr-1"/>Сплошной</Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="gradient" id="canvas-bg-gradient" />
          <Label htmlFor="canvas-bg-gradient" className="text-xs"><Droplets className="inline h-3 w-3 mr-1"/>Градиент</Label>
        </div>
      </RadioGroup>

      {backgroundType === "solid" && (
        <div className="space-y-2">
            <div>
              <Label htmlFor="canvasSolidBgColor" className="text-[10px] text-[var(--text-secondary)]">Цвет фона</Label>
              <Input
                id="canvasSolidBgColor"
                type="color"
                value={localCanvasSolidBgColor}
                onChange={handleSolidBgColorChange}
                className="h-8 w-full mt-1 p-0.5 rounded-lg border-[rgba(99,139,255,0.25)]"
              />
            </div>
        </div>
      )}

      {backgroundType === "gradient" && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="canvasGradientColor1" className="text-[10px] text-[var(--text-secondary)]">Цвет 1</Label>
            <Input
              id="canvasGradientColor1"
              type="color"
              value={localGradientColor1}
              onChange={(e) => {
                setLocalGradientColor1(e.target.value);
                applyGradientToCanvas(e.target.value, localGradientColor2, localGradientAngle);
              }}
              className="h-8 w-full mt-1 p-0.5"
            />
          </div>
          <div>
            <Label htmlFor="canvasGradientColor2" className="text-[10px] text-[var(--text-secondary)]">Цвет 2</Label>
            <Input
              id="canvasGradientColor2"
              type="color"
              value={localGradientColor2}
              onChange={(e) => {
                setLocalGradientColor2(e.target.value);
                applyGradientToCanvas(localGradientColor1, e.target.value, localGradientAngle);
              }}
              className="h-8 w-full mt-1 p-0.5"
            />
          </div>
          <div>
            <Label htmlFor="canvasGradientAngle" className="text-[10px] text-[var(--text-secondary)]">Угол градиента (deg)</Label>
            <Input
              id="canvasGradientAngle"
              type="number"
              value={localGradientAngle}
              onChange={(e) => {
                setLocalGradientAngle(e.target.value);
                applyGradientToCanvas(localGradientColor1, localGradientColor2, e.target.value);
              }}
              placeholder="90"
              className="mt-1 text-xs h-8 bg-[rgba(15,22,48,0.6)] border-[rgba(99,139,255,0.25)] text-[var(--text-primary)] focus:border-[rgba(99,139,255,0.5)] focus:ring-0"
            />
          </div>
        </div>
      )}


      <div className="h-px bg-[rgba(99,139,255,0.15)] my-1" />
      <p className="section-label mt-2 mb-1">Сетка Холста</p>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-grid-switch"
          checked={gridSettings.showGrid}
          onCheckedChange={(checked) => onUpdateGridSettings(checked, gridSettings.gridSize, gridSettings.gridType, gridSettings.columns, gridSettings.columnGutter)}
        />
        <Label htmlFor="show-grid-switch" className="text-xs text-[var(--text-secondary)]">Показать сетку</Label>
      </div>

      {gridSettings.showGrid && (
        <div className="space-y-2 mt-2">
          {/* Grid type tabs */}
          <div className="flex gap-1">
            {(['dots', 'lines', 'columns'] as const).map(type => (
              <button
                key={type}
                onClick={() => onUpdateGridSettings(true, gridSettings.gridSize, type, gridSettings.columns, gridSettings.columnGutter)}
                className={`flex-1 py-1 text-[10px] rounded-lg border transition-all ${
                  (gridSettings.gridType ?? 'dots') === type
                    ? 'bg-[rgba(99,139,255,0.2)] border-[rgba(99,139,255,0.5)] text-[#638bff]'
                    : 'border-[rgba(99,139,255,0.15)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {type === 'dots' ? 'Точки' : type === 'lines' ? 'Линии' : 'Колонки'}
              </button>
            ))}
          </div>

          {(gridSettings.gridType ?? 'dots') !== 'columns' && (
            <div>
              <Label htmlFor="grid-size" className="text-[10px] text-[var(--text-secondary)]">Размер ячейки (px)</Label>
              <Input
                id="grid-size"
                type="number"
                value={gridSettings.gridSize || '20'}
                onChange={(e) => onUpdateGridSettings(true, e.target.value, gridSettings.gridType, gridSettings.columns, gridSettings.columnGutter)}
                className="mt-1 text-xs h-8 bg-[rgba(15,22,48,0.6)] border-[rgba(99,139,255,0.25)] text-[var(--text-primary)] focus:border-[rgba(99,139,255,0.5)] focus:ring-0"
                min="4"
              />
            </div>
          )}

          {(gridSettings.gridType ?? 'dots') === 'columns' && (
            <div className="space-y-2">
              <div>
                <Label className="text-[10px] text-[var(--text-secondary)]">Количество колонок</Label>
                <Input
                  type="number"
                  value={gridSettings.columns ?? '12'}
                  onChange={(e) => onUpdateGridSettings(true, gridSettings.gridSize, 'columns', e.target.value, gridSettings.columnGutter)}
                  className="mt-1 text-xs h-8 bg-[rgba(15,22,48,0.6)] border-[rgba(99,139,255,0.25)] text-[var(--text-primary)] focus:border-[rgba(99,139,255,0.5)] focus:ring-0"
                  min="1" max="24"
                />
              </div>
              <div>
                <Label className="text-[10px] text-[var(--text-secondary)]">Отступ между колонками (px)</Label>
                <Input
                  type="number"
                  value={gridSettings.columnGutter ?? '16'}
                  onChange={(e) => onUpdateGridSettings(true, gridSettings.gridSize, 'columns', gridSettings.columns, e.target.value)}
                  className="mt-1 text-xs h-8 bg-[rgba(15,22,48,0.6)] border-[rgba(99,139,255,0.25)] text-[var(--text-primary)] focus:border-[rgba(99,139,255,0.5)] focus:ring-0"
                  min="0"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}