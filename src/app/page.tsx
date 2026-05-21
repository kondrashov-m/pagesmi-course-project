"use client";

import AppHeader from "@/components/layout/app-header";
import EditorSidebarLeft, { type ActiveLeftTab } from "@/components/layout/editor-sidebar-left";
import EditorSidebarRight from "@/components/layout/editor-sidebar-right";
import VisualEditorCanvas from "@/components/visual-editor-canvas";
import type { CanvasElement, ElementType, SitePage, SiteData } from "@/types/canvas-element";
import { useState, type CSSProperties, useMemo, useEffect, useCallback, useRef } from "react";
import ImageSourceDialog from "@/components/image-source-dialog";
import { PREDEFINED_LOGO_ICONS } from "@/lib/predefined-icons";
import { buildTemplateBody } from "@/lib/page-templates";
import { arrayMove } from "@dnd-kit/sortable";
import { HEADER_PRESETS, FOOTER_PRESETS, buildHeaderHtml, buildFooterHtml } from "@/lib/header-footer-presets";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import OnboardingOverlay from "@/components/onboarding-overlay";
import CanvasViewport from "@/components/layout/canvas-viewport";
import RichTextToolbar from "@/components/rich-text-toolbar";
import { useSavedBlocks } from "@/hooks/use-saved-blocks";
import type { SeoData } from "@/types/canvas-element";

const MAX_HISTORY_LENGTH = 50;





const MODULE_DEFAULT_CANVAS_STYLES: CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  padding: '0',
  width: '100%',
  position: 'relative',
  margin: '0 auto',
};

// Helpers for absolute-position layout
const _px = (v: string | number | undefined): number => {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  return parseFloat(v) || 0;
};
const estimateBlockHeight = (el: CanvasElement): number => {
  const s = el.styles || {};
  const minH = _px(s.minHeight as string);
  const h = _px(s.height as string);
  const pt = _px((s.paddingTop as string) || (s.padding as string));
  const pb = _px((s.paddingBottom as string) || (s.padding as string));
  const gap = _px(s.gap as string);
  const isRow = (s.flexDirection as string) === 'row';

  // Estimate from children recursively
  let childrenH = 0;
  if (el.children && el.children.length > 0) {
    const childHeights = el.children.map(c => estimateBlockHeight(c));
    childrenH = isRow
      ? Math.max(...childHeights) // side by side — take tallest
      : childHeights.reduce((a, b) => a + b + gap, 0); // stacked — sum
  }

  const fromContent = pt + pb + (childrenH || 80);
  return Math.max(minH, h, fromContent) || 300;
};
const getNextFreeY = (elements: CanvasElement[]): number => {
  const freeEls = elements.filter(el => el.type !== 'Header' && el.type !== 'Footer');
  if (freeEls.length === 0) return 20;
  return freeEls.reduce((max, el, i) => {
    const top = _px(el.styles?.top as string) || (20 + i * 130);
    return Math.max(max, top + estimateBlockHeight(el) + 20);
  }, 20);
};

const MODULE_DEFAULT_GRID_SETTINGS: import("@/types/canvas-element").SitePage['gridSettings'] = {
  showGrid: false,
  gridSize: "20",
  gridType: 'dots',
  columns: '12',
  columnGutter: '16',
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
  const iconColor = headerIconColor || '#638bff';
  const siteNameColor = headerSiteNameColor || '#e8eaf6';

  const navLinks = pages.map(page => {
    const isActive = page.path === activePath;
    const color = isActive ? '#638bff' : 'rgba(232,234,246,0.65)';
    const weight = isActive ? '600' : '400';
    return `<a href="${page.path.startsWith('/') ? page.path : '/' + page.path}" style="color:${color};font-weight:${weight};font-size:14px;text-decoration:none;transition:color .2s;">${page.name}</a>`;
  }).join('<span style="margin:0 12px;color:rgba(99,139,255,0.25);">|</span>');

  let logoElement = '';
  if (logoSrc) {
    logoElement = `<img src="${logoSrc}" alt="${siteName} Logo" style="height:32px;width:auto;margin-right:10px;" data-ai-hint="logo custom" />`;
  } else if (selectedLogoIconKey && PREDEFINED_LOGO_ICONS[selectedLogoIconKey]) {
    logoElement = PREDEFINED_LOGO_ICONS[selectedLogoIconKey].svgString.replace('<svg', `<svg style="color:${iconColor};width:28px;height:28px;margin-right:8px;flex-shrink:0;"`);
  } else {
    logoElement = `<svg style="color:${iconColor};width:26px;height:26px;margin-right:8px;flex-shrink:0;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
  }

  return `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;width:100%;gap:8px;">
      <a href="/" style="display:flex;align-items:center;gap:6px;text-decoration:none;flex-shrink:0;">
        ${logoElement}
        <span style="color:${siteNameColor};font-size:18px;font-weight:700;letter-spacing:-0.3px;white-space:nowrap;">${siteName}</span>
      </a>
      <nav data-placeholder="page-nav-links" style="display:flex;align-items:center;gap:0;flex-shrink:0;">
        ${navLinks}
      </nav>
    </div>
  `;
}

function generateFooterHtml(pages: SitePage[], siteName: string, activePath: string, copyrightTextProp?: string): string {
  const navLinks = pages.map(page => {
    const isActive = page.path === activePath;
    const color = isActive ? '#638bff' : 'rgba(232,234,246,0.5)';
    return `<a href="${page.path.startsWith('/') ? page.path : '/' + page.path}" style="color:${color};font-size:12px;text-decoration:none;transition:color .2s;">${page.name}</a>`;
  }).join('<span style="margin:0 10px;color:rgba(99,139,255,0.2);">|</span>');

  const currentYear = new Date().getFullYear();
  const effectiveCopyrightText = copyrightTextProp !== undefined ? copyrightTextProp : `&copy; ${currentYear} ${siteName}. Все права защищены.`;

  return `
    <div style="display:flex;flex-direction:row;flex-wrap:wrap;justify-content:space-between;align-items:center;width:100%;padding:0 8px;gap:8px 16px;">
      <p style="color:rgba(232,234,246,0.45);font-size:12px;margin:0;white-space:nowrap;">${effectiveCopyrightText}</p>
      <nav data-placeholder="page-footer-nav-links" style="display:flex;align-items:center;gap:0;flex-shrink:0;">
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
      defaultStyles = { backgroundColor: 'rgba(8,12,20,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: '#e8eaf6', padding: '16px 28px', width: '100%', minHeight: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(99,139,255,0.18)', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
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
      defaultStyles = { backgroundColor: 'rgba(6,9,16,0.95)', color: 'rgba(232,234,246,0.5)', padding: '16px 28px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(99,139,255,0.12)', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
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
                        padding: '16px',
                        minHeight: '100px',
                        backgroundColor: 'rgba(99,139,255,0.05)',
                        border: '1px solid rgba(99,139,255,0.15)',
                        borderRadius: '8px',
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
        defaultStyles = { padding: '24px', border: '1px dashed rgba(99,139,255,0.3)', backgroundColor: 'rgba(15,22,48,0.35)', minHeight: '100px', width: '100%', margin: '8px 0', borderRadius: '10px', boxSizing: 'border-box' };
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

// ИСПРАВЛЕНА: функция теперь принимает string | null
const findElementByIdRecursive = (elements: CanvasElement[], id: string | null): CanvasElement | null => {
  if (!id) return null;
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
  const [siteData, setSiteDataState] = useState<SiteData>(initialSiteData());
  const [historyStack, setHistoryStack] = useState<SiteData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const historyStackRef = useRef<SiteData[]>([]);
  const currentHistoryIndexRef = useRef<number>(-1);
  useEffect(() => { historyStackRef.current = historyStack; }, [historyStack]);
  useEffect(() => { currentHistoryIndexRef.current = currentHistoryIndex; }, [currentHistoryIndex]);

  const isMobile = useIsMobile();
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [mobileRightSidebarOpen, setMobileRightSidebarOpen] = useState(false);
  const [pendingParentIdForImage, setPendingParentIdForImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Редирект admin → /admin (admin не должен работать в редакторе)
  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      window.location.replace("/admin");
    }
  }, [user, authLoading]);

  // ID активного проекта (выбранного на дашборде)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Загружаем конкретный проект по activeProjectId или первый доступный
  useEffect(() => {
    if (!user) return;

    const projectId = typeof window !== 'undefined'
      ? localStorage.getItem('activeProjectId_' + user.id)
      : null;

    setActiveProjectId(projectId);

    fetch('/api/projects')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = data?.projects ?? [];
        if (list.length === 0) return;

        // Ищем нужный проект или берём первый
        const target = projectId
          ? list.find((p: any) => p.id === projectId) ?? list[0]
          : list[0];

        if (!projectId && typeof window !== 'undefined') {
          localStorage.setItem('activeProjectId_' + user.id, target.id);
          setActiveProjectId(target.id);
        }

        const d = target.data as SiteData;
        if (d?.pages?.length && d?.siteName) {
          // Если activePageId не совпадает ни с одной страницей — берём первую
          const validActive = d.pages.find(p => p.id === d.activePageId)
            ? d.activePageId
            : d.pages[0].id;
          const normalized: SiteData = { ...d, activePageId: validActive };
          setSiteDataState(normalized);
          setHistoryStack([normalized]);
          setCurrentHistoryIndex(0);
          toast({ title: 'Проект загружен', description: `"${target.name}"` });
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
        const newHistoryStack = historyStackRef.current.slice(0, currentHistoryIndexRef.current + 1);
        newHistoryStack.push(finalSiteDataForHistory);
        if (newHistoryStack.length > MAX_HISTORY_LENGTH) {
          newHistoryStack.splice(0, newHistoryStack.length - MAX_HISTORY_LENGTH);
        }
        setHistoryStack(newHistoryStack);
        setCurrentHistoryIndex(newHistoryStack.length - 1);
      }
      return finalSiteDataForHistory;
    });
  }, []);

  const handleSaveProject = useCallback(async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Войдите для сохранения' });
      return;
    }
    try {
      const projectId = typeof window !== 'undefined'
        ? localStorage.getItem('activeProjectId_' + user.id)
        : null;

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId ?? undefined,
          name: siteData.siteName,
          data: siteData,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        // Запоминаем ID нового проекта если создали
        if (!projectId && saved.project?.id && typeof window !== 'undefined') {
          localStorage.setItem('activeProjectId_' + user.id, saved.project.id);
          setActiveProjectId(saved.project.id);
        }
        toast({ title: 'Проект сохранён', description: `"${siteData.siteName}"` });
      } else {
        toast({ variant: 'destructive', title: 'Ошибка сохранения' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Нет соединения с сервером' });
    }
  }, [user, siteData, activeProjectId, toast]);

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
  const [activeRightTab, setActiveRightTab] = useState<"element" | "pages" | "layers" | "seo">("pages");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTool, setActiveTool] = useState<ElementType | null>(null);
  const { blocks: savedBlocks, save: saveBlock, remove: removeSavedBlock, instantiate: instantiateSavedBlock } = useSavedBlocks();

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

  const updateGridSettings = useCallback((show: boolean, size?: string, type?: string, columns?: string, columnGutter?: string) => {
    updateSiteDataAndHistory(prevSiteData => {
        const updatedPages = prevSiteData.pages.map(p => {
            if (p.id === prevSiteData.activePageId) {
                const gs = p.gridSettings || MODULE_DEFAULT_GRID_SETTINGS;
                return {
                    ...p,
                    gridSettings: {
                        showGrid: show,
                        gridSize: size !== undefined ? size : (gs.gridSize || MODULE_DEFAULT_GRID_SETTINGS.gridSize),
                        gridType: (type ?? gs.gridType ?? 'dots') as 'dots' | 'lines' | 'columns',
                        columns: columns ?? gs.columns ?? '12',
                        columnGutter: columnGutter ?? gs.columnGutter ?? '16',
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
        if (type === "Header") {
          newElementsList = [newElement, ...page.elements.filter(el => el.type !== "Header")];
        } else if (type === "Footer") {
          newElementsList = [...page.elements.filter(el => el.type !== "Footer"), newElement];
        } else {
          // Insert before footer if exists
          const footerIdx = page.elements.findIndex(el => el.type === "Footer");
          if (footerIdx !== -1) {
            newElementsList = [...page.elements];
            newElementsList.splice(footerIdx, 0, newElement);
          } else {
            newElementsList = [...page.elements, newElement];
          }
        }
      }
      return { ...page, elements: newElementsList };
    });
  }, [activePage, canvasElements, updateActivePageData, activeLeftTab]);

  const addElementAtPosition = useCallback((
    type: ElementType,
    x: number, y: number, width: number, height: number
  ) => {
    if (!activePage) return;
    updateActivePageData((page, currentSiteData) => {
      const newElement = createDefaultElement(type, currentSiteData, page.path, {
        styles: {
          position: 'absolute',
          left: `${Math.round(x)}px`,
          top: `${Math.round(y)}px`,
          width: `${Math.round(width)}px`,
          height: `${Math.round(height)}px`,
          margin: 0,
        },
      });
      setSelectedElementId(newElement.id);
      setActiveRightTab('element');
      const footerIdx = page.elements.findIndex(el => el.type === 'Footer');
      const list = [...page.elements];
      if (footerIdx !== -1) list.splice(footerIdx, 0, newElement);
      else list.push(newElement);
      return { ...page, elements: list };
    });
  }, [activePage, updateActivePageData]);

  // ИСПРАВЛЕНА: функция handleAddOrUpdateImage
  const handleAddOrUpdateImage = (imageData: { src: string; alt: string; aiHint?: string }) => {
    if (editingImageElementId) {
      const elementToUpdate = findElementByIdRecursive(canvasElements, editingImageElementId);
      updateActivePageData(page => ({
        ...page,
        elements: mapElementsRecursive(page.elements, editingImageElementId, el =>
          el.id === editingImageElementId
            ? { ...el, src: imageData.src, alt: imageData.alt, props: { ...el.props, 'data-ai-hint': imageData.aiHint || 'custom image'} }
            : el
        )
      }), elementToUpdate || undefined);
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
    }), elementToRemove || undefined);
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
    }), elementToUpdate || undefined);
  };

  const updateElementStylesForDevice = (elementId: string, newStyles: React.CSSProperties) => {
    if (deviceView === 'desktop') {
      updateElementStyles(elementId, newStyles);
      return;
    }
    updateActivePageData(page => ({
      ...page,
      elements: mapElementsRecursive(page.elements, elementId, el => ({
        ...el,
        responsiveStyles: {
          ...el.responsiveStyles,
          [deviceView]: newStyles,
        },
      })),
    }));
  };

  const updateElementContent = (elementId: string, newContent: string) => {
    const elementToUpdate = findElementByIdRecursive(canvasElements, elementId);
    updateActivePageData(page => ({
      ...page,
      elements: mapElementsRecursive(page.elements, elementId, el =>
        ({ ...el, content: newContent })
      )
    }), elementToUpdate || undefined);
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
    }), elementToUpdate || undefined);
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
    }), elementToMove || undefined);
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

  const selectedElement = findElementByIdRecursive(canvasElements, selectedElementId);

  const handleAddPresetBlock = useCallback((blockId: string) => {
    updateActivePageData((page, currentSiteData) => {
      let newElement: CanvasElement;

      switch (blockId) {
        case 'hero': {
          const h1 = createDefaultElement("Heading1", currentSiteData, page.path, {
            content: "Ваш заголовок здесь",
            styles: { display: 'block', textAlign: 'center', fontSize: '48px', fontWeight: 'bold', color: 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 16px 0' },
          });
          const para = createDefaultElement("Paragraph", currentSiteData, page.path, {
            content: "Описание вашего продукта или услуги. Расскажите, что делает вас уникальными.",
            styles: { display: 'block', textAlign: 'center', fontSize: '18px', color: 'hsl(var(--muted-foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 32px 0' },
          });
          const btn = createDefaultElement("Button", currentSiteData, page.path, {
            content: "Начать сейчас",
            styles: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', padding: '12px 32px', fontSize: '16px', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', border: 'none', cursor: 'pointer', borderRadius: '8px', margin: '0 auto' },
          });
          newElement = createDefaultElement("Container", currentSiteData, page.path, {
            styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', width: '100%', margin: '10px 0', minHeight: '400px', backgroundColor: 'transparent', border: 'none', borderRadius: '0px' },
            children: [h1, para, btn],
          });
          break;
        }
        case 'features': {
          const cols = [
            { title: "Быстро", text: "Молниеносная скорость работы и оптимизированная производительность." },
            { title: "Надёжно", text: "Высокая доступность и безопасность ваших данных." },
            { title: "Просто", text: "Интуитивный интерфейс без лишних настроек." },
          ];
          const colElements = cols.map(col => {
            const h3 = createDefaultElement("Heading3", currentSiteData, page.path, {
              content: col.title,
              styles: { display: 'block', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 8px 0' },
            });
            const p = createDefaultElement("Paragraph", currentSiteData, page.path, {
              content: col.text,
              styles: { display: 'block', textAlign: 'center', fontSize: '14px', color: 'hsl(var(--muted-foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0' },
            });
            return createDefaultElement("Container", currentSiteData, page.path, {
              styles: { flex: '1', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'hsl(var(--card))', borderRadius: '12px', minHeight: '160px', border: '1px solid hsl(var(--border))' },
              children: [h3, p],
            });
          });
          newElement = createDefaultElement("Container", currentSiteData, page.path, {
            styles: { display: 'flex', flexDirection: 'row', gap: '20px', padding: '40px 20px', width: '100%', margin: '10px 0', backgroundColor: 'transparent', border: 'none', alignItems: 'stretch', borderRadius: '0px' },
            children: colElements,
          });
          break;
        }
        case 'pricing': {
          const plans = [
            { name: "Базовый", price: "0 ₽/мес", desc: "Для личного использования", highlighted: false },
            { name: "Стандарт", price: "990 ₽/мес", desc: "Для малого бизнеса", highlighted: true },
            { name: "Бизнес", price: "4990 ₽/мес", desc: "Для крупных команд", highlighted: false },
          ];
          const planElements = plans.map(plan => {
            const h3 = createDefaultElement("Heading3", currentSiteData, page.path, {
              content: plan.name,
              styles: { display: 'block', textAlign: 'center', fontSize: '18px', color: plan.highlighted ? '#FFFFFF' : 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 8px 0' },
            });
            const price = createDefaultElement("Heading2", currentSiteData, page.path, {
              content: plan.price,
              styles: { display: 'block', textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: plan.highlighted ? '#FFFFFF' : 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 12px 0' },
            });
            const desc = createDefaultElement("Paragraph", currentSiteData, page.path, {
              content: plan.desc,
              styles: { display: 'block', textAlign: 'center', fontSize: '14px', color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted-foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 20px 0' },
            });
            const btn = createDefaultElement("Button", currentSiteData, page.path, {
              content: "Выбрать план",
              styles: { backgroundColor: plan.highlighted ? '#FFFFFF' : 'hsl(var(--primary))', color: plan.highlighted ? '#6366F1' : 'hsl(var(--primary-foreground))', padding: '10px 24px', fontSize: '14px', fontFamily: 'Inter, sans-serif', width: '100%', height: 'auto', border: 'none', cursor: 'pointer', borderRadius: '6px' },
            });
            return createDefaultElement("Container", currentSiteData, page.path, {
              styles: { flex: '1', padding: '30px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: plan.highlighted ? '#6366F1' : 'hsl(var(--card))', borderRadius: '12px', border: plan.highlighted ? 'none' : '1px solid hsl(var(--border))', minHeight: '240px' },
              children: [h3, price, desc, btn],
            });
          });
          newElement = createDefaultElement("Container", currentSiteData, page.path, {
            styles: { display: 'flex', flexDirection: 'row', gap: '20px', padding: '40px 20px', width: '100%', margin: '10px 0', backgroundColor: 'transparent', border: 'none', alignItems: 'stretch', borderRadius: '0px' },
            children: planElements,
          });
          break;
        }
        case 'team': {
          const members = [
            { name: "Алексей Иванов", role: "CEO & Основатель" },
            { name: "Мария Смирнова", role: "CTO & Разработчик" },
            { name: "Дмитрий Козлов", role: "Дизайнер" },
          ];
          const memberElements = members.map(m => {
            const avatar = createDefaultElement("Container", currentSiteData, page.path, {
              styles: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent))', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', minHeight: '80px' },
              children: [],
            });
            const name = createDefaultElement("Heading3", currentSiteData, page.path, {
              content: m.name,
              styles: { display: 'block', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: 'hsl(var(--foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 4px 0' },
            });
            const role = createDefaultElement("Paragraph", currentSiteData, page.path, {
              content: m.role,
              styles: { display: 'block', textAlign: 'center', fontSize: '13px', color: 'hsl(var(--muted-foreground))', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0' },
            });
            return createDefaultElement("Container", currentSiteData, page.path, {
              styles: { flex: '1', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', minHeight: '160px' },
              children: [avatar, name, role],
            });
          });
          newElement = createDefaultElement("Container", currentSiteData, page.path, {
            styles: { display: 'flex', flexDirection: 'row', gap: '20px', padding: '40px 20px', width: '100%', margin: '10px 0', backgroundColor: 'transparent', border: 'none', alignItems: 'stretch', borderRadius: '0px' },
            children: memberElements,
          });
          break;
        }
        case 'cta': {
          const h2 = createDefaultElement("Heading2", currentSiteData, page.path, {
            content: "Готовы начать?",
            styles: { display: 'block', textAlign: 'center', fontSize: '36px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 16px 0' },
          });
          const ctaPara = createDefaultElement("Paragraph", currentSiteData, page.path, {
            content: "Присоединяйтесь к тысячам компаний, которые уже используют наш продукт.",
            styles: { display: 'block', textAlign: 'center', fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0 0 32px 0' },
          });
          const ctaBtn = createDefaultElement("Button", currentSiteData, page.path, {
            content: "Попробовать бесплатно",
            styles: { backgroundColor: '#FFFFFF', color: '#6366F1', padding: '14px 40px', fontSize: '16px', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' },
          });
          newElement = createDefaultElement("Container", currentSiteData, page.path, {
            styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', width: '100%', margin: '10px 0', minHeight: '300px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none', borderRadius: '16px' },
            children: [h2, ctaPara, ctaBtn],
          });
          break;
        }
        default:
          newElement = createDefaultElement("Container", currentSiteData, page.path, {
            props: { 'data-layout-type': 'simple' },
          });
      }

      // Assign absolute position below existing elements
      const nextY = getNextFreeY(page.elements);
      newElement = {
        ...newElement,
        styles: {
          ...newElement.styles,
          position: 'absolute',
          left: '0px',
          top: `${nextY}px`,
          width: '100%',
          margin: 0,
        },
      };

      setSelectedElementId(newElement.id);
      setActiveRightTab("element");
      if (activeLeftTab === 'canvas') setActiveLeftTab('elements');

      const footerIdx = page.elements.findIndex(el => el.type === "Footer");
      if (footerIdx !== -1) {
        const list = [...page.elements];
        list.splice(footerIdx, 0, newElement);
        return { ...page, elements: list };
      }
      return { ...page, elements: [...page.elements, newElement] };
    });
  }, [updateActivePageData, activeLeftTab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        removeElementFromCanvas(selectedElementId);
        return;
      }
      if (e.key === 'Escape') {
        setSelectedElementId(null);
        setActiveRightTab('pages');
        return;
      }
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedElementId, removeElementFromCanvas, handleUndo, handleRedo]);

  const handleApplyTemplate = useCallback((templateId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Применить шаблон? Содержимое страницы будет заменено.')) return;

    updateActivePageData((page, sd) => {
      const path = page.path;

      const mkEl = (type: ElementType, content: string | undefined, styles: CSSProperties, children: CanvasElement[] = [], extraProps = {}): CanvasElement => ({
        id: crypto.randomUUID(),
        type,
        content,
        styles,
        props: extraProps,
        children,
      });

      const mk = {
        h1: (text: string, s?: CSSProperties) => mkEl("Heading1", text, { display: 'block', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0', ...s }),
        h2: (text: string, s?: CSSProperties) => mkEl("Heading2", text, { display: 'block', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0', ...s }),
        h3: (text: string, s?: CSSProperties) => mkEl("Heading3", text, { display: 'block', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0', ...s }),
        p: (text: string, s?: CSSProperties) => mkEl("Paragraph", text, { display: 'block', fontFamily: 'Inter, sans-serif', width: 'auto', height: 'auto', margin: '0', ...s }),
        btn: (text: string, s?: CSSProperties) => mkEl("Button", text, { width: 'auto', height: 'auto', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', borderRadius: '8px', ...s }),
        box: (children: CanvasElement[], s?: CSSProperties) => mkEl("Container", undefined, { border: 'none', minHeight: 'auto', margin: '0', padding: '0', ...s }, children),
      };

      const header = createDefaultElement("Header", sd, path);
      const footer = createDefaultElement("Footer", sd, path);
      const body = buildTemplateBody(templateId, mk);

      // Stack body elements vertically with absolute positions
      let yOffset = 20;
      const positionedBody = body.map(el => {
        const positioned = {
          ...el,
          styles: {
            ...el.styles,
            position: 'absolute' as const,
            left: '0px',
            top: `${yOffset}px`,
            width: '100%',
            margin: 0,
          },
        };
        // +30% buffer for actual font/content height, 40px gap between sections
        yOffset += Math.round(estimateBlockHeight(el) * 1.3) + 40;
        return positioned;
      });

      setSelectedElementId(null);
      setActiveRightTab('pages');

      return { ...page, elements: [header, ...positionedBody, footer] };
    });
  }, [updateActivePageData]);

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

  const handleReorderElements = useCallback((activeId: string, overId: string) => {
    updateActivePageData(page => {
      const reorder = (els: CanvasElement[]): CanvasElement[] => {
        const ai = els.findIndex(e => e.id === activeId);
        const oi = els.findIndex(e => e.id === overId);
        if (ai !== -1 && oi !== -1) return arrayMove(els, ai, oi);
        return els.map(e => e.children?.length
          ? { ...e, children: reorder(e.children) }
          : e
        );
      };
      return { ...page, elements: reorder(page.elements) };
    });
  }, [updateActivePageData]);

  const handleApplyHeaderStyle = useCallback((styleId: string) => {
    updateActivePageData((page, sd) => {
      const preset = HEADER_PRESETS.find(p => p.id === styleId);
      if (!preset) return page;
      const newElements = page.elements.map(el => {
        if (el.type !== "Header") return el;
        return {
          ...el,
          styles: { ...preset.styles },
          props: { ...el.props, headerStyleId: styleId },
          content: buildHeaderHtml(styleId, sd.pages, sd.siteName, page.path, { ...el.props, headerStyleId: styleId }),
        };
      });
      return { ...page, elements: newElements };
    });
  }, [updateActivePageData]);

  const toggleHeaderFreeform = useCallback(() => {
    updateActivePageData((page, sd) => ({
      ...page,
      elements: page.elements.map(el => {
        if (el.type !== 'Header') return el;
        const nowFreeform = !el.props?.freeform;
        if (nowFreeform) {
          return {
            ...el,
            props: { ...el.props, freeform: true },
            styles: { ...el.styles, height: `${Math.max(80, parseFloat(String(el.styles?.minHeight || 0)) || 80)}px`, minHeight: undefined },
            children: el.children || [],
          };
        } else {
          const styleId = el.props?.headerStyleId || 'standard';
          const preset = HEADER_PRESETS.find(p => p.id === styleId);
          return {
            ...el,
            props: { ...el.props, freeform: false },
            styles: preset ? { ...preset.styles } : el.styles,
            children: [],
            content: buildHeaderHtml(styleId, sd.pages, sd.siteName, page.path, el.props),
          };
        }
      }),
    }));
  }, [updateActivePageData]);

  const updateHeaderBg = useCallback((color: string) => {
    updateActivePageData(page => ({
      ...page,
      elements: page.elements.map(el =>
        el.type === 'Header' ? { ...el, styles: { ...el.styles, backgroundColor: color } } : el
      ),
    }));
  }, [updateActivePageData]);

  const addElementToHeader = useCallback((type: ElementType, x: number, y: number, w: number, h: number) => {
    const newEl: CanvasElement = {
      id: crypto.randomUUID(),
      type,
      styles: { position: 'absolute', left: `${Math.round(x)}px`, top: `${Math.round(y)}px`, width: `${Math.round(w)}px`, height: `${Math.round(h)}px`, color: '#e8eaf6', fontFamily: 'Inter, sans-serif', fontSize: '16px' },
      content: type === 'Heading1' ? 'Заголовок' : type === 'Paragraph' ? 'Текст' : type === 'Button' ? 'Кнопка' : undefined,
    };
    updateActivePageData(page => ({
      ...page,
      elements: page.elements.map(el =>
        el.type === 'Header' ? { ...el, children: [...(el.children || []), newEl] } : el
      ),
    }));
  }, [updateActivePageData]);

  const handleApplyFooterStyle = useCallback((styleId: string) => {
    updateActivePageData((page, sd) => {
      const preset = FOOTER_PRESETS.find(p => p.id === styleId);
      if (!preset) return page;
      const newElements = page.elements.map(el => {
        if (el.type !== "Footer") return el;
        return {
          ...el,
          styles: { ...preset.styles },
          props: { ...el.props, footerStyleId: styleId },
          content: buildFooterHtml(styleId, sd.pages, sd.siteName, page.path, el.props?.copyrightText),
        };
      });
      return { ...page, elements: newElements };
    });
  }, [updateActivePageData]);

  if (!activePage || siteData.pages.length === 0) {
    return null;
  }

  const effectiveGridSettings = currentGridSettings || MODULE_DEFAULT_GRID_SETTINGS;

  const updatePageSeo = (seo: SeoData) => {
    updateSiteDataAndHistory(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, seo } : p),
    }));
  };

  const leftSidebarProps = {
    onAddElement: (type: ElementType, attributes?: Partial<Pick<CanvasElement, 'src' | 'alt' | 'props'>>) => {
      const parentId = selectedElement?.type === 'Container' ? selectedElementId : null;
      addElementToCanvasOrContainer(type, attributes, parentId);
    },
    onAddImage: () => openImageDialogForNew(null),
    activeTab: activeLeftTab,
    onTabChange: handleActiveLeftTabChange,
    canvasStyles: currentCanvasStyles,
    onUpdateCanvasStyles: updateCanvasStyles,
    gridSettings: effectiveGridSettings,
    onUpdateGridSettings: updateGridSettings,
    activePageElements: canvasElements,
    onAddPresetBlock: handleAddPresetBlock,
    onApplyTemplate: handleApplyTemplate,
    savedBlocks,
    onInstantiateBlock: (block: import("@/types/canvas-element").SavedBlock) => {
      const el = instantiateSavedBlock(block);
      const footerIdx = canvasElements.findIndex(e => e.type === 'Footer');
      updateActivePageData(page => {
        const list = [...page.elements];
        footerIdx !== -1 ? list.splice(footerIdx, 0, el) : list.push(el);
        return { ...page, elements: list };
      });
    },
    onRemoveSavedBlock: removeSavedBlock,
    activeTool,
    onSetActiveTool: setActiveTool,
  };

  const rightSidebarProps = {
    selectedElement: selectedElement,
    onUpdateElementStyle: updateElementStylesForDevice,
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
    onApplyHeaderStyle: handleApplyHeaderStyle,
    onApplyFooterStyle: handleApplyFooterStyle,
    canvasElements: canvasElements,
    onSelectElement: handleSelectElement,
    deviceView,
    onSaveBlock: (el: CanvasElement, name: string) => saveBlock(el, name),
    currentPageSeo: activePage?.seo ?? {},
    onUpdatePageSeo: updatePageSeo,
  };


  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #080C14 0%, #0d1526 100%)',
        padding: '2rem', textAlign: 'center', fontFamily: 'Inter, sans-serif',
      }}>
        {/* Иконка */}
        <div style={{
          width: 88, height: 88, borderRadius: '1.5rem',
          background: 'rgba(99,139,255,0.1)', border: '1px solid rgba(99,139,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem', fontSize: '2.5rem',
        }}>
          💻
        </div>

        {/* Заголовок */}
        <h1 style={{ color: '#e8eaf6', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Редактор недоступен
        </h1>
        <p style={{ color: 'rgba(232,234,246,0.5)', maxWidth: '300px', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '2rem' }}>
          Визуальный редактор PagesMi работает только на&nbsp;компьютере или ноутбуке
        </p>

        {/* Что можно сделать */}
        <div style={{
          background: 'rgba(15,22,48,0.7)', border: '1px solid rgba(99,139,255,0.18)',
          borderRadius: '1rem', padding: '1.25rem 1.5rem', maxWidth: '300px',
          marginBottom: '1.5rem', backdropFilter: 'blur(20px)',
        }}>
          <p style={{ color: 'rgba(232,234,246,0.4)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Доступно с телефона
          </p>
          {[
            ['📋', 'Список проектов', '/dashboard'],
            ['👤', 'Профиль', '/profile'],
          ].map(([icon, label, href]) => (
            <a key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.6rem 0.75rem', borderRadius: '0.6rem',
              textDecoration: 'none', color: '#e8eaf6', fontSize: '0.875rem',
              marginBottom: '0.35rem', background: 'rgba(99,139,255,0.06)',
              border: '1px solid rgba(99,139,255,0.12)',
            }}>
              <span>{icon}</span>
              <span>{label}</span>
              <span style={{ marginLeft: 'auto', color: 'rgba(232,234,246,0.3)', fontSize: '0.8rem' }}>→</span>
            </a>
          ))}
        </div>

        <p style={{ color: 'rgba(232,234,246,0.2)', fontSize: '0.75rem' }}>
          PagesMi · Конструктор сайтов
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#080C14' }}>
      <AppHeader
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        currentSiteData={siteData}
        onToggleMobileLeftSidebar={() => setMobileLeftSidebarOpen(prev => !prev)}
        onToggleMobileRightSidebar={() => setMobileRightSidebarOpen(prev => !prev)}
        onSaveProject={handleSaveProject}
        deviceView={deviceView}
        onDeviceViewChange={setDeviceView}
      />
      <div className="flex flex-1 overflow-hidden px-1 pb-1">
        {isMobile ? (
          <>
            <Sheet open={mobileLeftSidebarOpen} onOpenChange={setMobileLeftSidebarOpen}>
              <SheetContent side="left" className="w-72 p-0">
                <EditorSidebarLeft {...leftSidebarProps} isMobile={true} onApplyHeaderStyle={handleApplyHeaderStyle} onToggleHeaderFreeform={toggleHeaderFreeform} onUpdateHeaderBg={updateHeaderBg} />
              </SheetContent>
            </Sheet>
            <main className="flex-1 overflow-hidden relative" style={{ backgroundColor: '#0F172A' }}>
              <CanvasViewport deviceView={deviceView}>
                <VisualEditorCanvas
                  elements={canvasElements}
                  onRemoveElement={removeElementFromCanvas}
                  onUpdateElement={updateElementOnCanvas}
                  selectedElementId={selectedElementId}
                  onSelectElement={handleSelectElement}
                  onUpdateElementContent={updateElementContent}
                  onUpdateElementStyle={updateElementStylesForDevice}
                  onMoveElement={moveElement}
                  onEditImage={openImageDialogForEdit}
                  onCopyElement={copyElement}
                  canvasStyles={currentCanvasStyles}
                  showGrid={effectiveGridSettings.showGrid}
                  gridSize={effectiveGridSettings.gridSize}
                  gridType={effectiveGridSettings.gridType}
                  gridColumns={effectiveGridSettings.columns}
                  gridColumnGutter={effectiveGridSettings.columnGutter}
                  onSwitchToBlocks={() => { setActiveLeftTab('elements'); setLeftSidebarOpen(true); }}
                  onSwitchToTemplates={() => { setActiveLeftTab('templates'); setLeftSidebarOpen(true); }}
                  hasPageContent={canvasElements.filter(el => el.type !== 'Header' && el.type !== 'Footer').some(el => el.type !== 'Container' || (el.children && el.children.length > 0))}
                  onReorderElements={handleReorderElements}
                  deviceView={deviceView}
                  activeTool={activeTool}
                  onSetActiveTool={setActiveTool}
                  onAddElementAtPosition={addElementAtPosition}
                  onAddElementToHeader={addElementToHeader}
                />
              </CanvasViewport>
            </main>
            <Sheet open={mobileRightSidebarOpen} onOpenChange={setMobileRightSidebarOpen}>
              <SheetContent side="right" className="w-80 p-0">
                <EditorSidebarRight {...rightSidebarProps} isMobile={true} isOpen={true} />
              </SheetContent>
            </Sheet>
          </>
        ) : (
          /* ── Десктоп: холст на всю площадь, панели — оверлей ── */
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

            {/* Холст — всегда на всю ширину/высоту */}
            <main style={{ position: 'absolute', inset: 0, backgroundColor: '#0F172A' }}>
              <CanvasViewport deviceView={deviceView}>
                <VisualEditorCanvas
                  elements={canvasElements}
                  onRemoveElement={removeElementFromCanvas}
                  onUpdateElement={updateElementOnCanvas}
                  selectedElementId={selectedElementId}
                  onSelectElement={handleSelectElement}
                  onUpdateElementContent={updateElementContent}
                  onUpdateElementStyle={updateElementStylesForDevice}
                  onMoveElement={moveElement}
                  onEditImage={openImageDialogForEdit}
                  onCopyElement={copyElement}
                  canvasStyles={currentCanvasStyles}
                  showGrid={effectiveGridSettings.showGrid}
                  gridSize={effectiveGridSettings.gridSize}
                  gridType={effectiveGridSettings.gridType}
                  gridColumns={effectiveGridSettings.columns}
                  gridColumnGutter={effectiveGridSettings.columnGutter}
                  onSwitchToBlocks={() => { setActiveLeftTab('elements'); setLeftSidebarOpen(true); }}
                  onSwitchToTemplates={() => { setActiveLeftTab('templates'); setLeftSidebarOpen(true); }}
                  hasPageContent={canvasElements.filter(el => el.type !== 'Header' && el.type !== 'Footer').some(el => el.type !== 'Container' || (el.children && el.children.length > 0))}
                  onReorderElements={handleReorderElements}
                  deviceView={deviceView}
                  activeTool={activeTool}
                  onSetActiveTool={setActiveTool}
                  onAddElementAtPosition={addElementAtPosition}
                  onAddElementToHeader={addElementToHeader}
                />
              </CanvasViewport>
            </main>

            {/* Левая панель — поверх холста */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'stretch', zIndex: 20 }}>
              <div className="sidebar-collapsible" style={{ width: leftSidebarOpen ? 'var(--sidebar-l)' : 0, opacity: leftSidebarOpen ? 1 : 0, pointerEvents: leftSidebarOpen ? 'auto' : 'none' }}>
                <EditorSidebarLeft {...leftSidebarProps} isMobile={false} onApplyHeaderStyle={handleApplyHeaderStyle} onToggleHeaderFreeform={toggleHeaderFreeform} onUpdateHeaderBg={updateHeaderBg} />
              </div>
              <button
                onClick={() => setLeftSidebarOpen(v => !v)}
                className="sidebar-toggle-btn sidebar-toggle-btn-left"
                title={leftSidebarOpen ? 'Свернуть панель' : 'Развернуть панель'}
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="rgba(99,139,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {leftSidebarOpen ? <polyline points="6,2 2,6 6,10"/> : <polyline points="2,2 6,6 2,10"/>}
                </svg>
              </button>
            </div>

            {/* Правая панель — поверх холста */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'stretch', zIndex: 20 }}>
              <button
                onClick={() => setRightSidebarOpen(v => !v)}
                className="sidebar-toggle-btn sidebar-toggle-btn-right"
                title={rightSidebarOpen ? 'Свернуть панель' : 'Развернуть панель'}
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="rgba(99,139,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {rightSidebarOpen ? <polyline points="2,2 6,6 2,10"/> : <polyline points="6,2 2,6 6,10"/>}
                </svg>
              </button>
              <div className="sidebar-collapsible" style={{ width: rightSidebarOpen ? 'var(--sidebar-r)' : 0, opacity: rightSidebarOpen ? 1 : 0, pointerEvents: rightSidebarOpen ? 'auto' : 'none' }}>
                <EditorSidebarRight {...rightSidebarProps} isMobile={false} isOpen={rightSidebarOpen} />
              </div>
            </div>

          </div>
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
      <OnboardingOverlay />
      <RichTextToolbar
        selectedElement={selectedElement ?? null}
        onUpdateStyle={updateElementStylesForDevice}
        deviceView={deviceView}
      />
    </div>
  );
}