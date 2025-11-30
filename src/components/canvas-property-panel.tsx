
"use client";

import type { CSSProperties } from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  onUpdateGridSettings: (show: boolean, size?: string) => void;
}

const INTERNAL_DEFAULT_GRID_SETTINGS = { showGrid: false, gridSize: "20" }; 

export default function CanvasPropertyPanel({
  canvasStyles,
  onUpdateCanvasStyles,
  gridSettings: gridSettingsProp,
  onUpdateGridSettings,
}: CanvasPropertyPanelProps) {

  const gridSettings = gridSettingsProp || INTERNAL_DEFAULT_GRID_SETTINGS;

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
    
    if (determinedNewBackgroundType === "gradient" && canvasStyles.background) {
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
  }, [canvasStyles.background, canvasStyles.backgroundColor, backgroundType, localCanvasSolidBgColor, localGradientAngle, localGradientColor1, localGradientColor2]); 

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
  
  const applyGradientChangeToCanvas = useCallback(() => {
    if (backgroundType === 'gradient') {
        onUpdateCanvasStyles({ 
            background: `linear-gradient(${localGradientAngle}deg, ${localGradientColor1}, ${localGradientColor2})`,
            backgroundColor: undefined 
        });
    }
  }, [localGradientAngle, localGradientColor1, localGradientColor2, backgroundType, onUpdateCanvasStyles]);

  useEffect(() => {
    if (backgroundType === 'gradient') {
        applyGradientChangeToCanvas();
    }
  }, [localGradientColor1, localGradientColor2, localGradientAngle, backgroundType, applyGradientChangeToCanvas]);


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
      <CardHeader className="pb-2 pt-0 px-0"> 
        <CardTitle className="font-headline text-base">Свойства Холста</CardTitle>
        <CardDescription>Настройте внешний вид и сетку для текущей страницы.</CardDescription>
      </CardHeader>

      <Separator />
      <h4 className="text-xs font-medium pt-1">Размеры Холста</h4>
      <div className="grid grid-cols-1 gap-2"> 
        <div>
          <Label htmlFor="canvasWidth" className="text-xs">Ширина</Label>
          <Input
            id="canvasWidth"
            type="text"
            value={getCurrentCanvasValue('width', '100%')}
            onChange={(e) => handleCanvasStyleChange('width', e.target.value)}
            placeholder="100%"
            className="mt-1 text-xs h-8"
          />
        </div>
      </div>
      <div>
          <Label htmlFor="canvasPadding" className="text-xs">Внутр. отступ</Label>
          <Input
            id="canvasPadding"
            type="text"
            value={getCurrentCanvasValue('padding', '20')}
            onChange={(e) => handleCanvasStyleChange('padding', e.target.value)}
            placeholder="20"
            className="mt-1 text-xs h-8"
          />
      </div>

      <Separator />
      <h4 className="text-xs font-medium pt-1">Фон Холста</h4>
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
              <Label htmlFor="canvasSolidBgColor" className="text-xs">Цвет фона</Label>
              <Input
                id="canvasSolidBgColor"
                type="color"
                value={localCanvasSolidBgColor}
                onChange={handleSolidBgColorChange} 
                className="h-8 w-full mt-1 p-0.5"
              />
            </div>
        </div>
      )}

      {backgroundType === "gradient" && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="canvasGradientColor1" className="text-xs">Цвет 1</Label>
            <Input
              id="canvasGradientColor1"
              type="color"
              value={localGradientColor1}
              onChange={(e) => setLocalGradientColor1(e.target.value)}
              className="h-8 w-full mt-1 p-0.5"
            />
          </div>
          <div>
            <Label htmlFor="canvasGradientColor2" className="text-xs">Цвет 2</Label>
            <Input
              id="canvasGradientColor2"
              type="color"
              value={localGradientColor2}
              onChange={(e) => setLocalGradientColor2(e.target.value)}
              className="h-8 w-full mt-1 p-0.5"
            />
          </div>
          <div>
            <Label htmlFor="canvasGradientAngle" className="text-xs">Угол (deg)</Label>
            <Input
              id="canvasGradientAngle"
              type="number"
              value={localGradientAngle}
              onChange={(e) => setLocalGradientAngle(e.target.value)}
              placeholder="90"
              className="mt-1 text-xs h-8"
            />
          </div>
        </div>
      )}


      <Separator />
      <h4 className="text-xs font-medium pt-1">Сетка Холста</h4>
       <div className="flex items-center space-x-2">
          <Switch
              id="show-grid-switch"
              checked={gridSettings.showGrid}
              onCheckedChange={(checked) => onUpdateGridSettings(checked, gridSettings.gridSize)}
          />
          <Label htmlFor="show-grid-switch" className="text-xs">Показать сетку</Label>
      </div>
      <div className="mt-2">
          <Label htmlFor="grid-size" className="text-xs">Размер ячейки (px)</Label>
          <Input
              id="grid-size"
              type="number"
              value={gridSettings.gridSize || INTERNAL_DEFAULT_GRID_SETTINGS.gridSize}
              onChange={(e) => onUpdateGridSettings(gridSettings.showGrid, e.target.value)}
              className="mt-1 text-xs h-8"
              placeholder={INTERNAL_DEFAULT_GRID_SETTINGS.gridSize}
              min="1"
              disabled={!gridSettings.showGrid}
          />
      </div>
    </div>
  );
}

    