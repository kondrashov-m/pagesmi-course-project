
export type ElementType = "Heading1" | "Heading2" | "Heading3" | "Paragraph" | "Button" | "Image" | "Container" | "Header" | "Footer";

export type DeviceView = "desktop" | "tablet" | "mobile";

export interface CanvasElement {
  id: string;
  type: ElementType;
  content?: string;
  src?: string;
  alt?: string;
  props?: Record<string, any> & {
    logoSrc?: string;
    selectedLogoIconKey?: string;
    headerIconColor?: string;
    headerSiteNameColor?: string;
    copyrightText?: string;
    'data-ai-hint'?: string;
    'data-layout-type'?: 'simple' | 'two-blocks' | 'three-blocks';
    href?: string;
    target?: string;
    hoverAnimation?: string;
    headerStyleId?: string;
    footerStyleId?: string;
    freeform?: boolean;
  };
  styles?: React.CSSProperties;
  responsiveStyles?: {
    tablet?: React.CSSProperties;
    mobile?: React.CSSProperties;
  };
  children?: CanvasElement[];
}

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export interface SitePage {
  id: string;
  name: string;
  path: string;
  elements: CanvasElement[];
  canvasStyles: React.CSSProperties;
  gridSettings: {
    showGrid: boolean;
    gridSize: string;
    gridType?: 'dots' | 'lines' | 'columns';
    columns?: string;
    columnGutter?: string;
  };
  seo?: SeoData;
}

export interface SavedBlock {
  id: string;
  name: string;
  element: CanvasElement;
  createdAt: number;
}

export interface SiteData {
  pages: SitePage[];
  activePageId: string;
  siteName: string;
}
