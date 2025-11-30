
"use client";

import AiAssistantPanel from "@/components/ai-assistant-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings2, FileText, Brain } from "lucide-react"; 
import PropertyInspectorPanel from "@/components/property-inspector-panel";
// import CanvasPropertyPanel from "@/components/canvas-property-panel"; // No longer needed here
import EditorSidebarRightPages from "./editor-sidebar-right-pages";
import type { CanvasElement, SitePage, ElementType } from "@/types/canvas-element";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface EditorSidebarRightProps {
  isOpen: boolean;
  isMobile?: boolean;
  selectedElement: CanvasElement | null;
  onUpdateElementStyle: (id: string, newStyles: CSSProperties) => void;
  onUpdateElementContent: (id: string, newContent: string) => void;
  onUpdateElementProp: (id: string, propName: string, propValue: any) => void;
  onEditImage?: () => void;
  onAddChildElement: (elementType: ElementType, attributes?: Partial<Pick<CanvasElement, 'props'>>) => void; // New
  onOpenImageDialogForContainer: () => void; // New
  
  // Canvas properties are now managed in the Left Sidebar
  // canvasStyles: CSSProperties;
  // onUpdateCanvasStyles: (newStyles: Partial<CSSProperties>) => void;
  // gridSettings: SitePage['gridSettings'];
  // onUpdateGridSettings: (show: boolean, size?: string) => void;
  
  sitePages: SitePage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  siteName: string;
  onUpdateSiteName: (newName: string) => void;
  onUpdatePageDetails: (pageId: string, details: { name?: string; path?: string }) => void;

  activeRightTab: "element" | "pages";
  onActiveRightTabChange: (tab: "element" | "pages") => void;
}

export default function EditorSidebarRight({
  isOpen,
  isMobile = false,
  selectedElement,
  onUpdateElementStyle,
  onUpdateElementContent,
  onUpdateElementProp,
  onEditImage,
  onAddChildElement, // New
  onOpenImageDialogForContainer, // New
  // canvasStyles, // Removed
  // onUpdateCanvasStyles, // Removed
  // gridSettings, // Removed
  // onUpdateGridSettings, // Removed
  sitePages,
  activePageId,
  onSelectPage,
  onAddPage,
  siteName,
  onUpdateSiteName,
  onUpdatePageDetails,
  activeRightTab,
  onActiveRightTabChange,
}: EditorSidebarRightProps) {
   const sidebarClass = cn(
    "h-full w-80 bg-card shadow-md flex flex-col", 
    isMobile ? "" : "border-l relative transition-transform duration-300 ease-in-out transform",
    !isMobile && (isOpen ? "translate-x-0" : "translate-x-full") 
  );

  const scrollAreaHeight = isMobile
    ? "h-[calc(100vh-var(--header-height,4rem)-var(--tabs-height,3rem)-2rem)]" 
    : "h-[calc(100vh-var(--header-height,4rem)-var(--tabs-height,3rem)-2rem)]"; 

  if (!isMobile && !isOpen) {
    return null;
  }

  return (
    <aside className={sidebarClass}>
      <Tabs 
        value={activeRightTab} 
        onValueChange={(value) => onActiveRightTabChange(value as "element" | "pages")} 
        className="flex flex-col h-full"
      >
        <div className={`p-4 ${isMobile ? "pt-6" : "pt-4"} pb-2`} style={{ '--tabs-height': '3rem' } as CSSProperties}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="element" className="text-xs px-1 sm:text-sm">
              <Settings2 className="mr-1 h-3.5 w-3.5" />
              {selectedElement ? "Элемент" : "Элемент"}
            </TabsTrigger>
            <TabsTrigger value="pages" className="text-xs px-1 sm:text-sm">
              <FileText className="mr-1 h-3.5 w-3.5" /> Страницы
            </TabsTrigger>
            {/* <TabsTrigger value="ai" className="text-xs px-1 sm:text-sm">
              <Brain className="mr-1 h-3.5 w-3.5" /> ИИ
            </TabsTrigger> */}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="element" className="p-0 h-full">
             <ScrollArea className={scrollAreaHeight}>
              {selectedElement ? (
                <PropertyInspectorPanel
                  selectedElement={selectedElement}
                  onUpdateElementStyle={onUpdateElementStyle}
                  onUpdateElementContent={onUpdateElementContent}
                  onUpdateElementProp={onUpdateElementProp}
                  onEditImage={onEditImage}
                  onAddChildElement={onAddChildElement} // Pass down new prop
                  onOpenImageDialogForContainer={onOpenImageDialogForContainer} // Pass down new prop
                />
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
                   <Settings2 className="h-10 w-10 text-muted-foreground mb-3" />
                  <p>Выберите элемент на холсте для редактирования его свойств.</p>
                  <p className="mt-1">Или перейдите на вкладку "Страницы" для управления страницами.</p>
                  <p className="text-xs mt-2">Свойства холста (фон, сетка) настраиваются в левой панели (вкладка "Холст").</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="pages" className="p-0 h-full">
            <EditorSidebarRightPages
                isOpen={true} 
                isMobile={isMobile}
                sitePages={sitePages}
                activePageId={activePageId}
                onSelectPage={onSelectPage}
                onAddPage={onAddPage}
                siteName={siteName}
                onUpdateSiteName={onUpdateSiteName}
                onUpdatePageDetails={onUpdatePageDetails}
            />
          </TabsContent>
          {/* <TabsContent value="ai" className="p-0 h-full">
            <AiAssistantPanel />
          </TabsContent> */}
        </div>
      </Tabs>
    </aside>
  );
}
