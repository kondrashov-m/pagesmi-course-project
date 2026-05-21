
"use client";

import { Settings2, FileText, Layers, Globe } from "lucide-react";
import PropertyInspectorPanel from "@/components/property-inspector-panel";
import EditorSidebarRightPages from "./editor-sidebar-right-pages";
import EditorSidebarRightLayers from "./editor-sidebar-right-layers";
import EditorSeoPanel from "./editor-seo-panel";
import type { CanvasElement, SitePage, ElementType, SeoData } from "@/types/canvas-element";
import type { CSSProperties } from "react";

interface EditorSidebarRightProps {
  isOpen: boolean;
  isMobile?: boolean;
  selectedElement: CanvasElement | null;
  onUpdateElementStyle: (id: string, newStyles: CSSProperties) => void;
  onUpdateElementContent: (id: string, newContent: string) => void;
  onUpdateElementProp: (id: string, propName: string, propValue: any) => void;
  onEditImage?: () => void;
  onAddChildElement: (
    elementType: ElementType,
    attributes?: Partial<Pick<CanvasElement, "props">>
  ) => void;
  onOpenImageDialogForContainer: () => void;

  sitePages: SitePage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  siteName: string;
  onUpdateSiteName: (newName: string) => void;
  onUpdatePageDetails: (
    pageId: string,
    details: { name?: string; path?: string }
  ) => void;

  activeRightTab: "element" | "pages" | "layers" | "seo";
  onActiveRightTabChange: (tab: "element" | "pages" | "layers" | "seo") => void;
  canvasElements?: CanvasElement[];
  onSelectElement?: (id: string) => void;
  onApplyHeaderStyle?: (styleId: string) => void;
  onApplyFooterStyle?: (styleId: string) => void;
  deviceView?: "desktop" | "tablet" | "mobile";
  onSaveBlock?: (element: CanvasElement, name: string) => void;
  currentPageSeo?: SeoData;
  onUpdatePageSeo?: (seo: SeoData) => void;
}

export default function EditorSidebarRight({
  isOpen,
  isMobile = false,
  selectedElement,
  onUpdateElementStyle,
  onUpdateElementContent,
  onUpdateElementProp,
  onEditImage,
  onAddChildElement,
  onOpenImageDialogForContainer,
  sitePages,
  activePageId,
  onSelectPage,
  onAddPage,
  siteName,
  onUpdateSiteName,
  onUpdatePageDetails,
  activeRightTab,
  onActiveRightTabChange,
  onApplyHeaderStyle,
  onApplyFooterStyle,
  canvasElements = [],
  onSelectElement,
  deviceView,
  onSaveBlock,
  currentPageSeo = {},
  onUpdatePageSeo,
}: EditorSidebarRightProps) {
  if (!isMobile && !isOpen) {
    return null;
  }

  const sidebarStyle: CSSProperties = isMobile
    ? { width: "100%", height: "100%" }
    : { width: "var(--sidebar-r)", flexShrink: 0 };

  return (
    <aside
      className={`glass-sidebar flex flex-col h-full ${isMobile ? "" : "rounded-l-2xl"}`}
      style={sidebarStyle}
    >
      {/* Tab switcher */}
      <div className="flex gap-1 p-2 pb-1.5 shrink-0 relative z-10">
        {(["element", "layers", "pages", "seo"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => onActiveRightTabChange(tab)}
            className={`glass-pill flex-1 py-1.5 text-xs font-semibold rounded-xl text-center transition-all duration-200 ${
              activeRightTab === tab ? "active text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab === "element" && <><Settings2 className="inline h-3 w-3 mr-0.5 mb-0.5" />Элемент</>}
            {tab === "layers"  && <><Layers    className="inline h-3 w-3 mr-0.5 mb-0.5" />Слои</>}
            {tab === "pages"   && <><FileText  className="inline h-3 w-3 mr-0.5 mb-0.5" />Страницы</>}
            {tab === "seo"     && <><Globe     className="inline h-3 w-3 mr-0.5 mb-0.5" />SEO</>}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative z-10">
        {activeRightTab === "element" && (
          <div className="h-full overflow-y-auto glass-scroll">
            {selectedElement ? (
              <PropertyInspectorPanel
                selectedElement={selectedElement}
                onUpdateElementStyle={onUpdateElementStyle}
                onUpdateElementContent={onUpdateElementContent}
                onUpdateElementProp={onUpdateElementProp}
                onEditImage={onEditImage}
                onAddChildElement={onAddChildElement}
                onOpenImageDialogForContainer={onOpenImageDialogForContainer}
                onApplyHeaderStyle={onApplyHeaderStyle}
                onApplyFooterStyle={onApplyFooterStyle}
                deviceView={deviceView}
                onSaveBlock={onSaveBlock}
              />
            ) : (
              <div className="p-4 flex flex-col items-center justify-center h-full text-center">
                <Settings2 className="h-10 w-10 text-[var(--text-muted)] mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">
                  Выберите элемент на холсте для редактирования его свойств.
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Или перейдите на вкладку «Страницы» для управления страницами.
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Свойства холста настраиваются в левой панели (вкладка «Холст»).
                </p>
              </div>
            )}
          </div>
        )}

        {activeRightTab === "layers" && (
          <EditorSidebarRightLayers
            elements={canvasElements}
            selectedId={selectedElement?.id ?? null}
            onSelect={(id) => { onSelectElement?.(id); }}
          />
        )}

        {activeRightTab === "pages" && (
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
        )}

        {activeRightTab === "seo" && (
          <div className="h-full overflow-y-auto glass-scroll">
            <EditorSeoPanel
              seo={currentPageSeo}
              pageName={sitePages.find(p => p.id === activePageId)?.name ?? ""}
              onChange={onUpdatePageSeo ?? (() => {})}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
