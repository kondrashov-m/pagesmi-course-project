
"use client";

import { CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Blocks, type LucideIcon, Heading1, Image as ImageIcon, MousePointerSquareDashed, Type, RectangleHorizontal, PanelTop, PanelBottom, LayoutDashboard as CanvasIcon, Columns } from "lucide-react";
import type { ElementType, SitePage, CanvasElement } from "@/types/canvas-element";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CSSProperties } from "react";
import CanvasPropertyPanel from "@/components/canvas-property-panel"; 
import { cn } from "@/lib/utils";

export type ActiveLeftTab = "elements" | "canvas"; 

const DraggableItem: React.FC<DraggableItemProps> = ({ icon: Icon, label, onClickAction, disabled }) => (
  <div
    className={cn(
        "flex items-center gap-3 p-3 border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed hover:shadow-sm hover:bg-card"
    )}
    onClick={!disabled ? onClickAction : undefined}
    role="button"
    tabIndex={disabled ? -1 : 0}
    onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onClickAction()}}
    aria-label={`Добавить элемент ${label}${disabled ? ' (недоступно)' : ''}`}
    aria-disabled={disabled}
  >
    <Icon className="h-5 w-5 text-primary" />
    <span className="text-sm">{label}</span>
  </div>
);

interface DraggableItemProps {
  icon: LucideIcon;
  label: string;
  elementType?: ElementType;
  onClickAction: () => void;
  disabled?: boolean;
}

interface EditorSidebarLeftProps {
  isMobile?: boolean;
  onAddElement: (type: ElementType, attributes?: Partial<Pick<CanvasElement, 'src' | 'alt' | 'props'>>) => void;
  onAddImage: () => void;
  activeTab: ActiveLeftTab;
  onTabChange: (tab: ActiveLeftTab) => void;
  canvasStyles: CSSProperties;
  onUpdateCanvasStyles: (newStyles: Partial<CSSProperties>) => void;
  gridSettings: SitePage['gridSettings'];
  onUpdateGridSettings: (show: boolean, size?: string) => void;
  activePageElements: CanvasElement[]; 
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
}: EditorSidebarLeftProps) {
  const sidebarClass = isMobile
    ? "h-full"
    : "h-full w-72 border-r bg-card shadow-md flex flex-col";

  const scrollAreaHeight = isMobile ? "h-[calc(100vh-10rem)]" : "h-[calc(100vh-var(--header-height,4rem)-var(--tabs-height,3rem)-2rem)]";

  const hasHeader = activePageElements.some(el => el.type === "Header");
  const hasFooter = activePageElements.some(el => el.type === "Footer");

  return (
    <aside className={sidebarClass}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as ActiveLeftTab)}
        className="flex flex-col h-full"
      >
        <CardHeader className={`${isMobile ? "pt-6" : ""} pb-2 px-2`} style={{ '--tabs-height': '3rem' } as CSSProperties}>
          <TabsList className="grid w-full grid-cols-2"> 
            <TabsTrigger value="elements" className="text-xs px-1 sm:text-sm sm:px-2 flex-shrink-0">
              <Blocks className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Элементы
            </TabsTrigger>
            <TabsTrigger value="canvas" className="text-xs px-1 sm:text-sm sm:px-2 flex-shrink-0">
              <CanvasIcon className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Холст
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <ScrollArea className={scrollAreaHeight}>
          <TabsContent value="elements" className="p-4 pt-2">
            <div className="space-y-3">
              <DraggableItem icon={PanelTop} label="Шапка (Header)" onClickAction={() => onAddElement("Header")} disabled={hasHeader} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex items-center gap-3 p-3 border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card hover:bg-muted/50"
                    role="button"
                    tabIndex={0}
                    aria-label="Добавить заголовок"
                  >
                    <Heading1 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Заголовок</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(theme(space.72)-theme(space.8))]">
                  <DropdownMenuItem onClick={() => onAddElement("Heading1")}>
                    Заголовок H1
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddElement("Heading2")}>
                    Заголовок H2
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddElement("Heading3")}>
                    Заголовок H3
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DraggableItem icon={Type} label="Параграф" onClickAction={() => onAddElement("Paragraph")} />
              <DraggableItem icon={ImageIcon} label="Изображение" onClickAction={onAddImage} />
              <DraggableItem icon={MousePointerSquareDashed} label="Кнопка" onClickAction={() => onAddElement("Button")} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex items-center gap-3 p-3 border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card hover:bg-muted/50"
                    role="button"
                    tabIndex={0}
                    aria-label="Добавить контейнер"
                  >
                    <RectangleHorizontal className="h-5 w-5 text-primary" />
                    <span className="text-sm">Контейнер</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(theme(space.72)-theme(space.8))]">
                  <DropdownMenuItem onClick={() => onAddElement("Container", { props: { 'data-layout-type': 'simple' } })}>
                    <RectangleHorizontal className="mr-2 h-4 w-4" /> Простой контейнер
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddElement("Container", { props: { 'data-layout-type': 'two-blocks' } })}>
                    <Columns className="mr-2 h-4 w-4" /> Два блока
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddElement("Container", { props: { 'data-layout-type': 'three-blocks' } })}>
                    <Columns className="mr-2 h-4 w-4" /> Три блока {/* Consider a different icon for 3 blocks if available */}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DraggableItem icon={PanelBottom} label="Подвал (Footer)" onClickAction={() => onAddElement("Footer")} disabled={hasFooter} />
            </div>
          </TabsContent>
          <TabsContent value="canvas" className="p-0 h-full">
             <CanvasPropertyPanel
                canvasStyles={canvasStyles}
                onUpdateCanvasStyles={onUpdateCanvasStyles}
                gridSettings={gridSettings}
                onUpdateGridSettings={onUpdateGridSettings}
              />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
}

    
