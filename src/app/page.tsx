
"use client";

import AppHeader from "@/components/layout/app-header";
import EditorSidebarLeft, { type ActiveLeftTab } from "@/components/layout/editor-sidebar-left";
import EditorSidebarRight from "@/components/layout/editor-sidebar-right";
import VisualEditorCanvas from "@/components/visual-editor-canvas";
import type { CanvasElement, ElementType, SitePage, SiteData } from "@/types/canvas-element";
import { useState, type CSSProperties, useMemo, useEffect, useCallback } from "react";
import ImageSourceDialog from "@/components/image-source-dialog";
import { PREDEFINED_LOGO_ICONS } from "@/lib/predefined-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context"; // Added

const MAX_HISTORY_LENGTH = 50;

const MODULE_DEFAULT_CANVAS_STYLES: CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  padding: '20px',
  width: '100%',
  position: 'relative',
  margin: '0 auto',
};

const MODULE_DEFAULT_GRID_SETTINGS = {
  showGrid: false,
  gridSize: "20",
};

function generateNavigationHtml(
  pages: SitePage[],
  siteName: string,
  activePath: string,
  logoSrc?: string,
  selectedLogoIconKey?: string,
  headerIconColor?: string,
  headerSiteNameColor?: string
): string {
  const navLinks = pages.map(page =>
    `<a href="${page.path.startsWith('/') ? page.path : '/' + page.path}" class="text-sm hover:underline ${page.path === activePath ? 'font-semibold text-primary' : 'text-muted-foreground'} mr-3 last:mr-0">${page.name}</a>`
  ).join(" ");

  let logoElement = '';
  const iconStyle = headerIconColor ? `style="color: ${headerIconColor};"` : '';
  const siteNameStyle = headerSiteNameColor ? `style="color: ${headerSiteNameColor};"` : '';

  if (logoSrc) {
    logoElement = `<img src="${logoSrc}" alt="${siteName} Logo" class="h-8 w-auto mr-3" data-ai-hint="logo custom" />`;
  } else if (selectedLogoIconKey && PREDEFINED_LOGO_ICONS[selectedLogoIconKey]) {
    logoElement = PREDEFINED_LOGO_ICONS[selectedLogoIconKey].svgString.replace('<svg', `<svg ${iconStyle} class="h-7 w-7 text-primary mr-2"`);
  } else {
    logoElement = `<svg ${iconStyle} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary mr-2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
  }

  return `
    <div class="flex justify-between items-center w-full">
      <a href="/" class="flex items-center gap-2 text-lg font-bold text-foreground">
        ${logoElement}
        <span ${siteNameStyle}>${siteName}</span>
      </a>
      <nav data-placeholder="page-nav-links">
        ${navLinks}
      </nav>
    </div>
  `;
}

function generateFooterHtml(pages: SitePage[], siteName: string, activePath: string, copyrightTextProp?: string): string {
  const navLinks = pages.map(page =>
    `<a href="${page.path.startsWith('/') ? page.path : '/' + page.path}" class="text-xs hover:underline ${page.path === activePath ? 'font-semibold text-primary' : 'text-muted-foreground'} mr-3 last:mr-0">${page.name}</a>`
  ).join(" ");

  const currentYear = new Date().getFullYear();
  const effectiveCopyrightText = copyrightTextProp !== undefined ? copyrightTextProp : `&copy; ${currentYear} ${siteName}. Все права защищены.`;

  return `
    <div class="flex flex-col sm:flex-row justify-between items-center w-full text-xs text-muted-foreground gap-2">
      <p>${effectiveCopyrightText}</p>
      <nav data-placeholder="page-footer-nav-links">
        ${navLinks}
      </nav>
    </div>
  `;
}

const createDefaultElement = (
  type: ElementType,
  siteDataForContent: SiteData,
  activePagePath: string,
  existingElementData?: Partial<CanvasElement>
): CanvasElement => {
  const newElementBase: Pick<CanvasElement, 'id' | 'type'> = {
    id: crypto.randomUUID(),
    type,
  };

  let defaultStyles: CSSProperties = {};
  let defaultProps: CanvasElement['props'] = { ...existingElementData?.props };
  let content: string | undefined = undefined;
  let children: CanvasElement[] = existingElementData?.children || [];
  let src: string | undefined = undefined;
  let alt: string | undefined = undefined;

  switch (type) {
    case "Header":
      defaultStyles = { backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', padding: '20px', width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid hsl(var(--border))', fontFamily: 'Inter, sans-serif' };
      content = generateNavigationHtml(
        siteDataForContent.pages,
        siteDataForContent.siteName,
        activePagePath,
        defaultProps?.logoSrc || existingElementData?.props?.logoSrc,
        defaultProps?.selectedLogoIconKey || existingElementData?.props?.selectedLogoIconKey,
        defaultProps?.headerIconColor || existingElementData?.props?.headerIconColor,
        defaultProps?.headerSiteNameColor || existingElementData?.props?.headerSiteNameColor
      );
      break;
    case "Footer":
      defaultStyles = { backgroundColor: '#222222', color: 'hsl(var(--primary-foreground))', padding: '20px', width: '100%', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid hsl(var(--border))', fontFamily: 'Inter, sans-serif' };
      const defaultCopyright = `&copy; ${new Date().getFullYear()} ${siteDataForContent.siteName}. Все права защищены.`;
      defaultProps.copyrightText = defaultProps.copyrightText ?? defaultCopyright;
      content = generateFooterHtml(siteDataForContent.pages, siteDataForContent.siteName, activePagePath, defaultProps.copyrightText);
      break;
    case "Heading1":
      content = "Заголовок H1";
      defaultStyles = { display: 'block', textAlign: 'left', fontSize: '32px', fontWeight: 'bold', color: 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '10px 0' };
      break;
    case "Heading2":
      content = "Заголовок H2";
      defaultStyles = { display: 'block', textAlign: 'left', fontSize: '28px', fontWeight: 'bold', color: 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '8px 0' };
      break;
    case "Heading3":
      content = "Заголовок H3";
      defaultStyles = { display: 'block', textAlign: 'left', fontSize: '24px', fontWeight: 'bold', color: 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '6px 0' };
      break;
    case "Paragraph":
      content = "Это новый параграф. Вы можете изменить этот текст.";
      defaultStyles = { display: 'block', textAlign: 'left', fontSize: '16px', color: 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '10px 0' };
      break;
    case "Button":
      content = "Нажми меня";
      defaultStyles = { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', padding: '10px 15px', fontSize: '16px', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', border: 'none', cursor: 'pointer', margin: '10px 0' };
      break;
    case "Image":
      src = existingElementData?.src || "https://placehold.co/300x200.png";
      alt = existingElementData?.alt || "Заполнитель изображения";
      defaultProps['data-ai-hint'] = defaultProps['data-ai-hint'] || (existingElementData?.src ? 'custom image' : 'placeholder image');
      defaultStyles = { width: '300px', height: 'auto', objectFit: 'cover', display: 'block', margin: '10px 0' };
      break;
    case "Container":
      const layoutType = defaultProps?.['data-layout-type'];
      if (layoutType === 'two-blocks' || layoutType === 'three-blocks') {
        defaultStyles = {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: '10px',
          padding: '10px',
          border: '1px dashed hsl(var(--accent))',
          minHeight: '120px',
          width: '100%',
          margin: '10px 0',
          backgroundColor: 'transparent'
        };
        const numChildren = layoutType === 'two-blocks' ? 2 : 3;
        if (children.length === 0 && !existingElementData?.children?.length) { 
            for (let i = 0; i < numChildren; i++) {
                children.push(createDefaultElement("Container", siteDataForContent, activePagePath, {
                    styles: {
                        flex: '1',
                        padding: '15px',
                        minHeight: '100px',
                        backgroundColor: 'hsl(var(--card))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    props: {'data-ai-hint': 'block content', 'data-is-child-block': true},
                    children: [],
                }));
            }
        }
      } else {
        defaultStyles = { padding: '20px', border: '1px dashed hsl(var(--border))', backgroundColor: 'hsl(var(--card))', minHeight: '100px', width: '100%', margin: '10px 0' };
        defaultProps['data-ai-hint'] = defaultProps['data-ai-hint'] || 'empty container';
         if (children.length === 0 && !defaultProps['data-is-child-block'] && !existingElementData?.children?.length) {
            children = [];
        }
      }
      break;
  }

  const finalStyles = { ...defaultStyles, ...existingElementData?.styles, borderRadius: existingElementData?.styles?.borderRadius || defaultStyles.borderRadius || '0px' };
  if (children.length === 0 && type !== 'Container' && !existingElementData?.children?.length) children = [];
  else if (type === 'Container' && !children && !existingElementData?.children?.length) children = [];

  return {
    ...newElementBase,
    content,
    src,
    alt,
    styles: finalStyles,
    props: defaultProps,
    children,
  };
};

const initialSiteData = (): SiteData => {
    const initialSiteName = 'PagesMi';
    const initialPagesData: Partial<SitePage>[] = [
      { id: crypto.randomUUID(), name: 'Главная', path: '/' },
      { id: crypto.randomUUID(), name: 'О проекте', path: '/about' },
    ];

    const tempCompletePagesForInit: SitePage[] = initialPagesData.map(pageData => ({
        id: pageData.id || crypto.randomUUID(),
        name: pageData.name || 'Новая страница',
        path: pageData.path || '/new-page',
        elements: [],
        canvasStyles: { ...MODULE_DEFAULT_CANVAS_STYLES },
        gridSettings: { ...MODULE_DEFAULT_GRID_SETTINGS },
    }));

    const completePages: SitePage[] = tempCompletePagesForInit.map(page => {
        const tempSiteContextForAllPages: SiteData = {
            pages: tempCompletePagesForInit,
            siteName: initialSiteName,
            activePageId: page.id
        };

        if (!page.elements.some(el => el.type === "Header")) {
            const headerData = tempCompletePagesForInit.flatMap(p => p.elements).find(el => el.type === "Header");
            page.elements.unshift(createDefaultElement("Header", tempSiteContextForAllPages, page.path!, headerData ? { styles: {...headerData.styles}, props: {...headerData.props}} : {}));
        }
        if (!page.elements.some(el => el.type === "Container")) {
             page.elements.push(createDefaultElement("Container", tempSiteContextForAllPages, page.path!, {props: {'data-layout-type': 'simple'}}));
        }
        if (!page.elements.some(el => el.type === "Footer")) {
            const footerData = tempCompletePagesForInit.flatMap(p => p.elements).find(el => el.type === "Footer");
            page.elements.push(createDefaultElement("Footer", tempSiteContextForAllPages, page.path!, footerData ? { styles: {...footerData.styles}, props: {...footerData.props}} : {}));
        }
        return page;
    });

    return {
      pages: completePages,
      activePageId: completePages.length > 0 && completePages[0].id ? completePages[0].id : '',
      siteName: initialSiteName,
    };
};

const findElementByIdRecursive = (elements: CanvasElement[], id: string): CanvasElement | null => {
  for (const element of elements) {
    if (element.id === id) {
      return element;
    }
    if (element.children && element.children.length > 0) {
      const foundChild = findElementByIdRecursive(element.children, id);
      if (foundChild) {
        return foundChild;
      }
    }
  }
  return null;
};

const mapElementsRecursive = (
  elements: CanvasElement[],
  targetId: string,
  updateFn: (element: CanvasElement) => CanvasElement
): CanvasElement[] => {
  return elements.map(element => {
    if (element.id === targetId) {
      return updateFn(element);
    }
    if (element.children && element.children.length > 0) {
      const updatedChildren = mapElementsRecursive(element.children, targetId, updateFn);
       if (updatedChildren !== element.children) {
        return { ...element, children: updatedChildren };
      }
    }
    return element;
  });
};

const filterElementsRecursive = (
  elements: CanvasElement[],
  targetId: string
): CanvasElement[] => {
  let changed = false;
  const filtered = elements.filter(element => {
    if (element.id === targetId) {
      changed = true;
      return false;
    }
    return true;
  });

  if (changed && filtered.length === 0 && elements.length === 1 && elements[0].id === targetId) return [];
  if (changed) return filtered;

  const result = elements.map(element => {
    if (element.children && element.children.length > 0) {
      const updatedChildren = filterElementsRecursive(element.children, targetId);
      if (updatedChildren !== element.children) {
        changed = true;
        return { ...element, children: updatedChildren };
      }
    }
    return element;
  });
  return changed ? result : elements;
};

const addChildToElementRecursive = (
  elements: CanvasElement[],
  parentId: string,
  childElement: CanvasElement
): CanvasElement[] => {
  return elements.map(element => {
    if (element.id === parentId) {
      if (element.type === "Container") {
        const newChildren = [...(element.children || []), childElement];
        return { ...element, children: newChildren };
      }
      return element;
    }
    if (element.children && element.children.length > 0) {
      const updatedChildren = addChildToElementRecursive(element.children, parentId, childElement);
      if (updatedChildren !== element.children) {
        return { ...element, children: updatedChildren };
      }
    }
    return element;
  });
};

export default function HomePage() {
  const [siteData, setSiteDataState] = useState<SiteData>(initialSiteData()); // Initial empty state, will be populated by effect
  const [historyStack, setHistoryStack] = useState<SiteData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const isMobile = useIsMobile();
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [mobileRightSidebarOpen, setMobileRightSidebarOpen] = useState(false);
  const [pendingParentIdForImage, setPendingParentIdForImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (authLoading || isInitialized) return;

    let dataToLoad: SiteData | null = null;
    if (user && typeof window !== 'undefined') { // Ensure localStorage is available
      try {
        const storedData = localStorage.getItem('pageForgeProject_' + user.id);
        if (storedData) {
          dataToLoad = JSON.parse(storedData) as SiteData;
          if (!dataToLoad || !dataToLoad.pages || !dataToLoad.siteName || dataToLoad.activePageId === undefined) {
            console.warn("Invalid project data found in localStorage, using default.");
            dataToLoad = null;
          } else {
             toast({ title: "Проект загружен", description: `Проект "${dataToLoad.siteName}" загружен из локального хранилища.` });
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки проекта из localStorage:", error);
        toast({ variant: "destructive", title: "Ошибка загрузки", description: "Не удалось загрузить проект из локального хранилища." });
        dataToLoad = null;
      }
    }

    const finalInitialData = dataToLoad || initialSiteData();
    setSiteDataState(finalInitialData);
    setHistoryStack([finalInitialData]);
    setCurrentHistoryIndex(0);
    setIsInitialized(true);

    if (finalInitialData.pages.length > 0 && 
        (!finalInitialData.activePageId || !finalInitialData.pages.find(p => p.id === finalInitialData.activePageId))) {
      
      const newActivePageId = finalInitialData.pages[0].id;
      setSiteDataState(prev => {
        const updatedData = { ...prev, activePageId: newActivePageId };
        // Update history manually here if needed, but for init, direct state update is okay.
        // We'll let updateSiteDataAndHistory handle future changes to history.
        const newStack = [...historyStack];
        if (newStack.length > 0) newStack[newStack.length-1] = updatedData; else newStack.push(updatedData);
        setHistoryStack(newStack);
        return updatedData;
      });
    }
  }, [user, authLoading, isInitialized, toast, historyStack]); // Added historyStack to dependencies for the activePageId fix

  const updateSiteDataAndHistory = useCallback((updater: (prevSiteData: SiteData) => SiteData, skipHistory: boolean = false) => {
    setSiteDataState(prevLiveSiteData => {
      const siteDataAfterUpdater = updater(prevLiveSiteData);

      const siteNameJustChanged = prevLiveSiteData.siteName !== siteDataAfterUpdater.siteName;
      const pageStructureJustChanged =
        prevLiveSiteData.pages.length !== siteDataAfterUpdater.pages.length ||
        siteDataAfterUpdater.pages.some((currentNewPage, idx) => {
          const prevLivePage = prevLiveSiteData.pages[idx];
          return (
            !prevLivePage ||
            prevLivePage.id !== currentNewPage.id ||
            prevLivePage.name !== currentNewPage.name ||
            prevLivePage.path !== currentNewPage.path
          );
        });

      let finalSiteDataForHistory = siteDataAfterUpdater;

      if (siteNameJustChanged || pageStructureJustChanged) {
        const regeneratedPages = finalSiteDataForHistory.pages.map(page => ({
          ...page,
          elements: page.elements.map(el => {
            if (el.type === "Header") {
              return {
                ...el,
                content: generateNavigationHtml(
                  finalSiteDataForHistory.pages,
                  finalSiteDataForHistory.siteName,
                  page.path,
                  el.props?.logoSrc,
                  el.props?.selectedLogoIconKey,
                  el.props?.headerIconColor,
                  el.props?.headerSiteNameColor
                ),
              };
            }
            if (el.type === "Footer") {
              return {
                ...el,
                content: generateFooterHtml(
                  finalSiteDataForHistory.pages,
                  finalSiteDataForHistory.siteName,
                  page.path,
                  el.props?.copyrightText
                ),
              };
            }
            return el;
          }),
        }));
        finalSiteDataForHistory = { ...finalSiteDataForHistory, pages: regeneratedPages };
      }

      if (!skipHistory) {
        const newHistoryStack = historyStack.slice(0, currentHistoryIndex + 1);
        newHistoryStack.push(finalSiteDataForHistory);
        if (newHistoryStack.length > MAX_HISTORY_LENGTH) {
          newHistoryStack.splice(0, newHistoryStack.length - MAX_HISTORY_LENGTH);
        }
        setHistoryStack(newHistoryStack);
        setCurrentHistoryIndex(newHistoryStack.length -1);
      }
      return finalSiteDataForHistory;
    });
  }, [currentHistoryIndex, historyStack]);

  const handleSaveProject = useCallback(() => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Сохранение невозможно",
        description: "Пожалуйста, войдите в систему, чтобы сохранить проект.",
      });
      return;
    }
    if (!isInitialized) {
        toast({
          title: "Подождите",
          description: "Инициализация проекта, попробуйте сохранить через несколько секунд.",
        });
        return;
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pageForgeProject_' + user.id, JSON.stringify(siteData));
        toast({
          title: "Проект сохранен",
          description: `Проект "${siteData.siteName}" успешно сохранен локально.`,
        });
      }
    } catch (error) {
      console.error("Ошибка сохранения проекта в localStorage:", error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось сохранить проект. Возможно, хранилище переполнено.",
      });
    }
  }, [user, siteData, toast, isInitialized]);

  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const prevHistoryIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(prevHistoryIndex);
      setSiteDataState(historyStack[prevHistoryIndex]);
    }
  }, [currentHistoryIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < historyStack.length - 1) {
      const nextHistoryIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(nextHistoryIndex);
      setSiteDataState(historyStack[nextHistoryIndex]);
    }
  }, [currentHistoryIndex, historyStack]);

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < historyStack.length - 1;

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isImageDialogVisible, setIsImageDialogVisible] = useState(false);
  const [editingImageElementId, setEditingImageElementId] = useState<string | null>(null);

  const [activeLeftTab, setActiveLeftTab] = useState<ActiveLeftTab>("elements");
  const [activeRightTab, setActiveRightTab] = useState<"element" | "pages">("pages");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const activePage = useMemo(() => siteData.pages.find(p => p.id === siteData.activePageId), [siteData.pages, siteData.activePageId]);

  const canvasElements = activePage?.elements || [];
  const currentCanvasStyles = activePage?.canvasStyles || MODULE_DEFAULT_CANVAS_STYLES;
  const currentGridSettings = activePage?.gridSettings || MODULE_DEFAULT_GRID_SETTINGS;

  const updateActivePageData = useCallback((updater: (page: SitePage, currentSiteData: SiteData) => SitePage, elementBeingUpdated?: CanvasElement, skipHistory?: boolean) => {
    updateSiteDataAndHistory(prevSiteData => {
      let updatedPages = prevSiteData.pages.map(p =>
        p.id === prevSiteData.activePageId ? updater(p, prevSiteData) : p
      );

      if (elementBeingUpdated && (elementBeingUpdated.type === "Header" || elementBeingUpdated.type === "Footer")) {
        const sourceStyles = elementBeingUpdated.styles;
        const sourceProps = elementBeingUpdated.props;

        updatedPages = updatedPages.map(pageToSync => {
          if (pageToSync.id === prevSiteData.activePageId && pageToSync.elements.find(el => el.id === elementBeingUpdated.id)) {
            return pageToSync;
          }

          const targetElementIndex = pageToSync.elements.findIndex(el => el.type === elementBeingUpdated.type);
          if (targetElementIndex !== -1) {
            const newElements = [...pageToSync.elements];
            const oldTargetElement = newElements[targetElementIndex];

            newElements[targetElementIndex] = {
              ...oldTargetElement,
              styles: { ...oldTargetElement.styles, ...sourceStyles },
              props: { ...oldTargetElement.props, ...sourceProps },
              content: elementBeingUpdated.type === "Header"
                ? generateNavigationHtml(
                    prevSiteData.pages,
                    prevSiteData.siteName,
                    pageToSync.path,
                    newElements[targetElementIndex].props?.logoSrc,
                    newElements[targetElementIndex].props?.selectedLogoIconKey,
                    newElements[targetElementIndex].props?.headerIconColor,
                    newElements[targetElementIndex].props?.headerSiteNameColor
                  )
                : generateFooterHtml(
                    prevSiteData.pages,
                    prevSiteData.siteName,
                    pageToSync.path,
                    newElements[targetElementIndex].props?.copyrightText
                  )
            };
            return { ...pageToSync, elements: newElements };
          }
          return pageToSync;
        });
      }
      return { ...prevSiteData, pages: updatedPages };
    }, skipHistory);
  }, [updateSiteDataAndHistory]);

  const updateCanvasStyles = useCallback((newStyles: Partial<CSSProperties>) => {
    updateActivePageData(page => {
      const updatedCanvasStyles = { ...page.canvasStyles, ...newStyles };
      if (newStyles.backgroundColor && newStyles.background === undefined && updatedCanvasStyles.background) {
        delete updatedCanvasStyles.background;
      } else if (newStyles.background && newStyles.backgroundColor === undefined && updatedCanvasStyles.backgroundColor) {
        delete updatedCanvasStyles.backgroundColor;
      }
      return { ...page, canvasStyles: updatedCanvasStyles };
    });
  }, [updateActivePageData]);

  const updateGridSettings = useCallback((show: boolean, size?: string) => {
    updateSiteDataAndHistory(prevSiteData => {
        const updatedPages = prevSiteData.pages.map(p => {
            if (p.id === prevSiteData.activePageId) {
                const gs = p.gridSettings || MODULE_DEFAULT_GRID_SETTINGS;
                return {
                    ...p,
                    gridSettings: {
                        showGrid: show,
                        gridSize: size !== undefined ? size : (gs.gridSize || MODULE_DEFAULT_GRID_SETTINGS.gridSize),
                    }
                };
            }
            return p;
        });
        return { ...prevSiteData, pages: updatedPages };
    });
  }, [updateSiteDataAndHistory]);

  const handleActiveLeftTabChange = (tab: ActiveLeftTab) => {
    setActiveLeftTab(tab);
    if (tab === "canvas") {
      setSelectedElementId(null);
      setActiveRightTab("pages");
    }
  };

  const addElementToCanvasOrContainer = useCallback((
    type: ElementType,
    attributes?: Partial<Pick<CanvasElement, 'src' | 'alt' | 'props'>>,
    parentId?: string | null
  ) => {
    if (!activePage) return;

    if (type === "Header" && !parentId && canvasElements.some(el => el.type === "Header")) return;
    if (type === "Footer" && !parentId && canvasElements.some(el => el.type === "Footer")) return;

    updateActivePageData((page, currentSiteData) => {
      let inheritedData: Partial<CanvasElement> = {};
      if ((type === "Header" || type === "Footer") && !parentId) {
        const existingGlobalElement = currentSiteData.pages
          .flatMap(p => p.elements)
          .find(el => el.type === type);
        if (existingGlobalElement) {
          inheritedData = { styles: { ...existingGlobalElement.styles }, props: { ...existingGlobalElement.props } };
        }
      }

      if (attributes?.props) {
        inheritedData.props = { ...inheritedData.props, ...attributes.props };
      }
      if (type === "Image" && attributes) {
        inheritedData.src = attributes.src;
        inheritedData.alt = attributes.alt;
      }

      const newElement = createDefaultElement(type, currentSiteData, page.path, inheritedData);
      setSelectedElementId(newElement.id);
      setActiveRightTab("element");
      if (activeLeftTab === 'canvas') setActiveLeftTab('elements');

      let newElementsList;
      if (parentId) {
        newElementsList = addChildToElementRecursive(page.elements, parentId, newElement);
      } else {
        newElementsList = [...page.elements, newElement];
        if (type === "Header") {
          const headerIndex = newElementsList.findIndex(el => el.type === "Header");
          if (headerIndex > 0 && headerIndex !== -1) {
            const headerElement = newElementsList.splice(headerIndex, 1)[0];
            newElementsList.unshift(headerElement);
          }
        }
        if (type === "Footer") {
          const footerIndex = newElementsList.findIndex(el => el.type === "Footer");
          if (footerIndex !== -1 && footerIndex < newElementsList.length - 1) {
            const footerElement = newElementsList.splice(footerIndex, 1)[0];
            newElementsList.push(footerElement);
          }
        }
      }
      return { ...page, elements: newElementsList };
    });
  }, [activePage, canvasElements, updateActivePageData, activeLeftTab]);

  const handleAddOrUpdateImage = (imageData: { src: string; alt: string; aiHint?: string }) => {
    if (editingImageElementId) {
      updateActivePageData(page => ({
        ...page,
        elements: mapElementsRecursive(page.elements, editingImageElementId, el =>
          el.id === editingImageElementId
            ? { ...el, src: imageData.src, alt: imageData.alt, props: { ...el.props, 'data-ai-hint': imageData.aiHint || 'custom image'} }
            : el
        )
      }), findElementByIdRecursive(canvasElements, editingImageElementId));
      setEditingImageElementId(null);
    } else if (pendingParentIdForImage) {
      addElementToCanvasOrContainer("Image", { src: imageData.src, alt: imageData.alt, props: { 'data-ai-hint': imageData.aiHint || 'placeholder image' } }, pendingParentIdForImage);
      setPendingParentIdForImage(null);
    } else {
      addElementToCanvasOrContainer("Image", {src: imageData.src, alt: imageData.alt, props: {'data-ai-hint': imageData.aiHint || 'placeholder image'}});
    }
    setIsImageDialogVisible(false);
    setActiveRightTab("element");
  };

  const openImageDialogForNew = (parentId?: string | null) => {
    setEditingImageElementId(null);
    setPendingParentIdForImage(parentId || null);
    setIsImageDialogVisible(true);
  };

  const openImageDialogForEdit = (element: CanvasElement) => {
    if (element.type === "Image") {
      setEditingImageElementId(element.id);
      setPendingParentIdForImage(null);
      setIsImageDialogVisible(true);
    }
  };

  const removeElementFromCanvas = (id: string) => {
    const elementToRemove = findElementByIdRecursive(canvasElements, id);
    updateActivePageData(page => ({
      ...page,
      elements: filterElementsRecursive(page.elements, id)
    }), elementToRemove);
    if (selectedElementId === id) {
      setSelectedElementId(null);
      setActiveRightTab("pages");
    }
  };

  const updateElementOnCanvas = (updatedElement: CanvasElement) => {
     updateActivePageData(page => ({
      ...page,
      elements: mapElementsRecursive(page.elements, updatedElement.id, () => updatedElement)
    }), updatedElement);
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      setActiveRightTab("element");
      if (activeLeftTab === 'canvas') {
        setActiveLeftTab('elements');
      }
    } else {
      setActiveRightTab("pages");
    }
  };

  const updateElementStyles = (elementId: string, newCompleteStyles: React.CSSProperties) => {
    const elementToUpdate = findElementByIdRecursive(canvasElements, elementId);
     updateActivePageData(page => ({
      ...page,
      elements: mapElementsRecursive(page.elements, elementId, el =>
        ({ ...el, styles: newCompleteStyles })
      )
    }), elementToUpdate ? { ...elementToUpdate, styles: newCompleteStyles } : undefined);
  };

  const updateElementContent = (elementId: string, newContent: string) => {
    const elementToUpdate = findElementByIdRecursive(canvasElements, elementId);
    updateActivePageData(page => ({
      ...page,
      elements: mapElementsRecursive(page.elements, elementId, el =>
        ({ ...el, content: newContent })
      )
    }), elementToUpdate ? { ...elementToUpdate, content: newContent } : undefined);
  };

  const updateElementProp = (elementId: string, propName: string, propValue: any) => {
    const elementToUpdate = findElementByIdRecursive(canvasElements, elementId);
     updateActivePageData((page, currentSiteData) => ({
      ...page,
      elements: mapElementsRecursive(page.elements, elementId, el => {
        const newProps = {...(el.props || {}), [propName]: propValue};
        if (propName === 'logoSrc' && propValue) {
          delete newProps.selectedLogoIconKey;
        } else if (propName === 'selectedLogoIconKey' && propValue) {
          delete newProps.logoSrc;
        }

        let newContent = el.content;
        if (el.type === "Header") {
          newContent = generateNavigationHtml(
              currentSiteData.pages,
              currentSiteData.siteName,
              page.path,
              newProps.logoSrc,
              newProps.selectedLogoIconKey,
              newProps.headerIconColor,
              newProps.headerSiteNameColor
            );
        } else if (el.type === "Footer") {
          newContent = generateFooterHtml(
            currentSiteData.pages,
            currentSiteData.siteName,
            page.path,
            newProps.copyrightText
          );
        }
        return { ...el, props: newProps, content: newContent };
      })
    }), elementToUpdate ? { ...elementToUpdate, props: {...(elementToUpdate?.props || {}), [propName]: propValue} } : undefined);
  };

 const moveElement = (elementId: string, direction: "up" | "down") => {
    const elementToMove = findElementByIdRecursive(canvasElements, elementId);

    const moveLogic = (elements: CanvasElement[], id: string, dir: "up" | "down"): CanvasElement[] => {
        let listCopy = [...elements];
        const index = listCopy.findIndex(el => el.id === id);

        if (index !== -1) {
            const item = listCopy.splice(index, 1)[0];
            if (!item) return elements;

            if ((item.type === "Header" && dir === "down") || (item.type === "Footer" && dir === "up")) {
                return elements;
            }

            let targetIndex = dir === "up" ? index - 1 : index + 1;

            if (dir === "up") {
                if (targetIndex < 0) targetIndex = 0;
                if (listCopy.length > 0 && listCopy[0]?.type === "Header" && targetIndex <= 0 && item.type !== "Header") {
                    targetIndex = 1;
                }
            } else {
                if (targetIndex > listCopy.length) targetIndex = listCopy.length;
                if (listCopy.length > 0 && listCopy[listCopy.length - 1]?.type === "Footer" && targetIndex >= listCopy.length && item.type !== "Footer") {
                    targetIndex = listCopy.length - 1;
                }
            }
            targetIndex = Math.max(0, Math.min(listCopy.length, targetIndex));
            listCopy.splice(targetIndex, 0, item);
        } else {
            let changedInChildren = false;
            listCopy = listCopy.map(el => {
                if (el.children && el.children.length > 0) {
                    const updatedChildren = moveLogic(el.children, id, dir);
                    if (updatedChildren !== el.children) {
                        changedInChildren = true;
                        return { ...el, children: updatedChildren };
                    }
                }
                return el;
            });
            if (!changedInChildren) return elements;
        }
        
        const headerIdx = listCopy.findIndex(el => el.type === "Header");
        if (headerIdx > 0) { 
            const headerElement = listCopy.splice(headerIdx, 1)[0];
            listCopy.unshift(headerElement);
        }

        const footerIdx = listCopy.findIndex(el => el.type === "Footer");
        if (footerIdx !== -1 && footerIdx < listCopy.length - 1) { 
            const footerElement = listCopy.splice(footerIdx, 1)[0];
            listCopy.push(footerElement);
        }
        return listCopy;
    };

    updateActivePageData(page => ({
      ...page,
      elements: moveLogic(page.elements, elementId, direction)
    }), elementToMove);
  };

  const copyElement = (elementId: string) => {
    const originalElement = findElementByIdRecursive(canvasElements, elementId);
    if (!originalElement || originalElement.type === "Header" || originalElement.type === "Footer") return;

    const deepCopyElement = (elToCopy: CanvasElement): CanvasElement => {
      const newEl: CanvasElement = {
        ...JSON.parse(JSON.stringify(elToCopy)),
        id: crypto.randomUUID(),
        children: elToCopy.children ? elToCopy.children.map(deepCopyElement) : [],
      };
      return newEl;
    };

    const newCopiedElement = deepCopyElement(originalElement);

    const addCopyLogic = (elements: CanvasElement[], idToFind: string, newEl: CanvasElement): { updated: boolean, list: CanvasElement[] } => {
      const result: CanvasElement[] = [];
      let foundAndAdded = false;
      let changedInRecursion = false;

      for (const el of elements) {
        result.push(el);
        if (el.id === idToFind) {
          result.push(newEl);
          foundAndAdded = true;
        } else if (el.children && el.children.length > 0) {
          const childResult = addCopyLogic(el.children, idToFind, newEl);
          if (childResult.updated) {
             const currentElIndex = result.length -1;
             result[currentElIndex] = { ...result[currentElIndex], children: childResult.list };
             changedInRecursion = true;
          }
        }
      }
      if (foundAndAdded || changedInRecursion) return { updated: true, list: result };
      return {updated: false, list: elements};
    };

    updateActivePageData(page => {
      const updateResult = addCopyLogic(page.elements, elementId, newCopiedElement);
       if (updateResult.updated) {
        setSelectedElementId(newCopiedElement.id);
        setActiveRightTab("element");
        if (activeLeftTab === 'canvas') setActiveLeftTab('elements');
      }
      return { ...page, elements: updateResult.list };
    }, originalElement);
  };

  const selectedElement = findElementByIdRecursive(canvasElements, selectedElementId || "");

  const addSitePage = () => {
    updateSiteDataAndHistory(prev => {
        const newPageName = `Новая страница ${prev.pages.length + 1}`;
        const newPagePath = `/${newPageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        const newPageId = crypto.randomUUID();

        let existingHeaderData: Partial<CanvasElement> | undefined;
        let existingFooterData: Partial<CanvasElement> | undefined;

        const anyPageWithHeader = prev.pages.find(p => p.elements.some(el => el.type === "Header"));
        if (anyPageWithHeader) {
            const headerEl = anyPageWithHeader.elements.find(el => el.type === "Header");
            if (headerEl) existingHeaderData = { styles: { ...headerEl.styles }, props: { ...headerEl.props } };
        }
        const anyPageWithFooter = prev.pages.find(p => p.elements.some(el => el.type === "Footer"));
        if (anyPageWithFooter) {
            const footerEl = anyPageWithFooter.elements.find(el => el.type === "Footer");
            if (footerEl) existingFooterData = { styles: { ...footerEl.styles }, props: { ...footerEl.props } };
        }

        const tempNewPageDefinitionForContent: SitePage = {
            id: newPageId, name: newPageName, path: newPagePath, elements: [],
            canvasStyles: { ...MODULE_DEFAULT_CANVAS_STYLES }, gridSettings: { ...MODULE_DEFAULT_GRID_SETTINGS }
        };
        const tempSiteDataForNewPageElements: SiteData = {
            ...prev, pages: [ ...prev.pages, tempNewPageDefinitionForContent ], activePageId: newPageId
        };

        const defaultElements: CanvasElement[] = [
          createDefaultElement("Header", tempSiteDataForNewPageElements, newPagePath, existingHeaderData),
          createDefaultElement("Container", tempSiteDataForNewPageElements, newPagePath, {props: {'data-layout-type': 'simple'}}),
          createDefaultElement("Footer", tempSiteDataForNewPageElements, newPagePath, existingFooterData),
        ];

        const finalNewPage: SitePage = { ...tempNewPageDefinitionForContent, elements: defaultElements };

        setSelectedElementId(null);
        setActiveRightTab("pages");
        return {
          ...prev,
          pages: [...prev.pages, finalNewPage],
          activePageId: newPageId,
        };
    });
  };

  const setActiveSitePage = (pageId: string) => {
    updateSiteDataAndHistory(prev => ({ ...prev, activePageId: pageId }));
    setSelectedElementId(null);
    setActiveRightTab("pages");
  };

  const updateSiteName = (newName: string) => {
    updateSiteDataAndHistory(prev => ({ ...prev, siteName: newName }));
  };

  const updateSitePageDetails = (pageId: string, details: { name?: string; path?: string }) => {
    updateSiteDataAndHistory(prevSiteData => {
      const updatedPages = prevSiteData.pages.map(page => {
        if (page.id === pageId) {
          return {
            ...page,
            name: details.name !== undefined ? details.name : page.name,
            path: details.path !== undefined ? details.path : page.path,
          };
        }
        return page;
      });
      return { ...prevSiteData, pages: updatedPages };
    });
  };

   if (!isInitialized) {
     return <div className="flex items-center justify-center h-screen bg-background"><p>Загрузка редактора и проекта...</p></div>;
   }
   if (!activePage && siteData.pages.length > 0 && siteData.activePageId) {
     console.error("HomePage: activePage is undefined but activePageId exists. Attempting to recover.");
     return <div className="flex items-center justify-center h-screen">Ошибка: Активная страница не найдена, но ID существует.</div>;
  }
   if (!activePage && siteData.pages.length > 0 && !siteData.activePageId) {
     console.warn("HomePage: activePage is undefined and activePageId is not set, but pages exist. Waiting for initialization.");
     return <div className="flex items-center justify-center h-screen">Инициализация страниц... (Активная страница не установлена)</div>;
  }
   if (siteData.pages.length === 0) {
      console.error("HomePage: No pages in siteData. This indicates an initialization issue.");
      return <div className="flex items-center justify-center h-screen">Создание начальных страниц... (Нет страниц)</div>;
   }

  const effectiveGridSettings = currentGridSettings || MODULE_DEFAULT_GRID_SETTINGS;

  const leftSidebarProps = {
    onAddElement: addElementToCanvasOrContainer,
    onAddImage: () => openImageDialogForNew(null),
    activeTab: activeLeftTab,
    onTabChange: handleActiveLeftTabChange,
    canvasStyles: currentCanvasStyles,
    onUpdateCanvasStyles: updateCanvasStyles,
    gridSettings: effectiveGridSettings,
    onUpdateGridSettings: updateGridSettings,
    activePageElements: canvasElements,
  };

  const rightSidebarProps = {
    selectedElement: selectedElement,
    onUpdateElementStyle: updateElementStyles,
    onUpdateElementContent: updateElementContent,
    onUpdateElementProp: updateElementProp,
    onEditImage: () => selectedElement && openImageDialogForEdit(selectedElement),
    onAddChildElement: (elementType: ElementType, attributes?: Partial<Pick<CanvasElement, 'src' | 'alt' | 'props'>>) => {
        if (selectedElementId) {
            addElementToCanvasOrContainer(elementType, attributes, selectedElementId);
        }
    },
    onOpenImageDialogForContainer: () => {
        if (selectedElementId) {
            openImageDialogForNew(selectedElementId);
        }
    },
    sitePages: siteData.pages,
    activePageId: siteData.activePageId!,
    onSelectPage: setActiveSitePage,
    onAddPage: addSitePage,
    siteName: siteData.siteName,
    onUpdateSiteName: updateSiteName,
    onUpdatePageDetails: updateSitePageDetails,
    activeRightTab: activeRightTab,
    onActiveRightTabChange: setActiveRightTab,
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        currentSiteData={siteData}
        onToggleMobileLeftSidebar={() => setMobileLeftSidebarOpen(prev => !prev)}
        onToggleMobileRightSidebar={() => setMobileRightSidebarOpen(prev => !prev)}
        onSaveProject={handleSaveProject}
      />
      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          <>
            <Sheet open={mobileLeftSidebarOpen} onOpenChange={setMobileLeftSidebarOpen}>
              <SheetContent side="left" className="w-72 p-0">
                <EditorSidebarLeft {...leftSidebarProps} isMobile={true} />
              </SheetContent>
            </Sheet>
             <main className="flex-1 p-4 overflow-auto bg-muted/50 relative">
              <VisualEditorCanvas
                elements={canvasElements}
                onRemoveElement={removeElementFromCanvas}
                onUpdateElement={updateElementOnCanvas}
                selectedElementId={selectedElementId}
                onSelectElement={handleSelectElement}
                onUpdateElementContent={updateElementContent}
                onUpdateElementStyle={updateElementStyles}
                onMoveElement={moveElement}
                onEditImage={openImageDialogForEdit}
                onCopyElement={copyElement}
                canvasStyles={currentCanvasStyles}
                showGrid={effectiveGridSettings.showGrid}
                gridSize={effectiveGridSettings.gridSize}
              />
            </main>
            <Sheet open={mobileRightSidebarOpen} onOpenChange={setMobileRightSidebarOpen}>
              <SheetContent side="right" className="w-80 p-0">
                <EditorSidebarRight {...rightSidebarProps} isMobile={true} isOpen={true} />
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <>
            <EditorSidebarLeft {...leftSidebarProps} isMobile={false} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-muted/50 relative">
              <VisualEditorCanvas
                elements={canvasElements}
                onRemoveElement={removeElementFromCanvas}
                onUpdateElement={updateElementOnCanvas}
                selectedElementId={selectedElementId}
                onSelectElement={handleSelectElement}
                onUpdateElementContent={updateElementContent}
                onUpdateElementStyle={updateElementStyles}
                onMoveElement={moveElement}
                onEditImage={openImageDialogForEdit}
                onCopyElement={copyElement}
                canvasStyles={currentCanvasStyles}
                showGrid={effectiveGridSettings.showGrid}
                gridSize={effectiveGridSettings.gridSize}
              />
            </main>
            <EditorSidebarRight {...rightSidebarProps} isMobile={false} isOpen={rightSidebarOpen} />
          </>
        )}
      </div>
      {isImageDialogVisible && (
        <ImageSourceDialog
          isOpen={isImageDialogVisible}
          onClose={() => {
            setIsImageDialogVisible(false);
            setEditingImageElementId(null);
            setPendingParentIdForImage(null);
          }}
          onSubmit={handleAddOrUpdateImage}
          initialSrc={editingImageElementId ? findElementByIdRecursive(canvasElements, editingImageElementId)?.src : undefined}
          initialAlt={editingImageElementId ? findElementByIdRecursive(canvasElements, editingImageElementId)?.alt : undefined}
          initialAiHint={editingImageElementId ? findElementByIdRecursive(canvasElements, editingImageElementId)?.props?.['data-ai-hint'] : undefined}
        />
      )}
       <footer className="bg-card border-t p-3 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} PagesMi. Все права защищены.
      </footer>
    </div>
  );
}

    