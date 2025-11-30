
export type ElementType = "Heading1" | "Heading2" | "Heading3" | "Paragraph" | "Button" | "Image" | "Container" | "Header" | "Footer";

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
    copyrightText?: string; // For Footer element copyright text
    'data-ai-hint'?: string; 
    'data-layout-type'?: 'simple' | 'two-blocks' | 'three-blocks';
  };
  styles?: React.CSSProperties;
  children?: CanvasElement[]; // Added this line
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
  };
}

export interface SiteData {
  pages: SitePage[];
  activePageId: string;
  siteName: string;
}


    
