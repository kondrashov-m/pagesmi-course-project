
import type { SiteData, SitePage, CanvasElement, ElementType } from '@/types/canvas-element';
import JSZip from 'jszip';
import type React from 'react';

function toKebabCase(str: string): string {
  if (str.includes('-')) {
      if (str.startsWith('--') || str === str.toLowerCase()) return str;
  }
  return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/^-/, '');
}


function cssPropertiesToInlineStyle(styles: React.CSSProperties | undefined): string {
  if (!styles) return '';
  return Object.entries(styles)
    .map(([prop, value]) => {
      if (value === undefined || value === null || value === '') return '';

      let kebabProp = prop.startsWith('--') ? prop : toKebabCase(prop);

      if (typeof value === 'string' && (value.includes('var(') || value.includes('hsl(var('))) {
        return `${kebabProp}: ${value.replace(/"/g, "'")};`;
      }

      if (typeof value === 'number' &&
          !['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order'].includes(prop) &&
          !kebabProp.startsWith('--')
         ) {
        return `${kebabProp}: ${value}px;`;
      }
      return `${kebabProp}: ${String(value).replace(/"/g, "'")};`;
    })
    .join(' ');
}

function getFilenameFromLocalPath(localPath: string): string {
  return localPath.substring(localPath.lastIndexOf('/') + 1);
}

function cleanExportStyles(styles?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!styles) return styles;
  const cleaned = { ...styles };
  // Remove editor-only visual cues
  const borderVal = String(cleaned.border || '');
  if (borderVal.includes('dashed')) delete cleaned.border;
  if (String(cleaned.backgroundColor || '').startsWith('rgba(15,22,48') && !Object.keys(cleaned).some(k => k === 'children')) {
    // keep glass bg only if it's intentional (non-empty containers)
  }
  return cleaned;
}

function elClass(id: string): string {
  return 'pmi-' + id.replace(/[^a-zA-Z0-9]/g, '_');
}

// Like cssPropertiesToInlineStyle but appends !important so media queries override inline styles
function cssToImportantRules(styles: React.CSSProperties): string {
  if (!styles) return '';
  return Object.entries(styles)
    .map(([prop, value]) => {
      if (value === undefined || value === null || value === '') return '';
      const kebabProp = prop.startsWith('--') ? prop : toKebabCase(prop);
      let strValue: string;
      if (typeof value === 'number' &&
          !['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order'].includes(prop)) {
        strValue = `${value}px`;
      } else {
        strValue = String(value).replace(/"/g, "'");
      }
      return `${kebabProp}: ${strValue} !important;`;
    })
    .filter(Boolean)
    .join(' ');
}

function generateResponsiveCss(elements: CanvasElement[]): { tabletCss: string; mobileCss: string; freeZoneTabletMinH: number; freeZoneMobileMinH: number } {
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];
  let freeZoneTabletMinH = 600;
  let freeZoneMobileMinH = 600;

  function process(el: CanvasElement, index: number) {
    const cls = elClass(el.id);
    if (el.responsiveStyles?.tablet && Object.keys(el.responsiveStyles.tablet).length > 0) {
      const css = cssToImportantRules(el.responsiveStyles.tablet as React.CSSProperties);
      if (css) tabletRules.push(`  .${cls} { ${css} }`);
      if (el.type !== 'Header' && el.type !== 'Footer') {
        const s = el.responsiveStyles.tablet as Record<string, unknown>;
        const top = parsePxValue(s.top as string | number, parsePxValue(el.styles?.top as string | number, 20 + index * 130));
        const h = parsePxValue(s.height as string | number, parsePxValue(el.styles?.height as string | number, 100));
        freeZoneTabletMinH = Math.max(freeZoneTabletMinH, top + h + 80);
      }
    }
    if (el.responsiveStyles?.mobile && Object.keys(el.responsiveStyles.mobile).length > 0) {
      const css = cssToImportantRules(el.responsiveStyles.mobile as React.CSSProperties);
      if (css) mobileRules.push(`  .${cls} { ${css} }`);
      if (el.type !== 'Header' && el.type !== 'Footer') {
        const s = el.responsiveStyles.mobile as Record<string, unknown>;
        const top = parsePxValue(s.top as string | number, parsePxValue(el.styles?.top as string | number, 20 + index * 130));
        const h = parsePxValue(s.height as string | number, parsePxValue(el.styles?.height as string | number, 100));
        freeZoneMobileMinH = Math.max(freeZoneMobileMinH, top + h + 80);
      }
    }
    el.children?.forEach((child, i) => process(child, i));
  }
  elements.forEach((el, i) => process(el, i));

  return {
    tabletCss: tabletRules.length > 0 ? `@media (max-width: 1023px) {\n${tabletRules.join('\n')}\n}` : '',
    mobileCss: mobileRules.length > 0 ? `@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}` : '',
    freeZoneTabletMinH,
    freeZoneMobileMinH,
  };
}

function renderElementToHtml(element: CanvasElement, isExporting: boolean): string {
  const exportStyles = isExporting && element.type === 'Container' ? cleanExportStyles(element.styles as Record<string, unknown>) : element.styles;
  const styleString = cssPropertiesToInlineStyle(exportStyles as Record<string, unknown>);
  const cls = isExporting ? ` class="${elClass(element.id)}"` : '';
  const attributes = element.props ? Object.entries(element.props)
    .map(([key, value]) => {
        if (typeof value === 'boolean') {
            return value ? toKebabCase(key) : '';
        }
        if (isExporting && key === 'data-ai-hint') return '';
        if (isExporting && key === 'data-is-child-block') return '';
        if (isExporting && key === 'data-layout-type' && (element.type !== 'Container' || !value)) return '';

        return `${toKebabCase(key)}="${String(value).replace(/"/g, '&quot;')}"`;
    })
    .filter(Boolean)
    .join(' ') : '';

  // Skip empty containers entirely in export
  if (element.type === 'Container' && (!element.children || element.children.length === 0)) {
    return '';
  }

  let childrenHtml = '';
  if (element.type === 'Container' && element.children && element.children.length > 0) {
    childrenHtml = element.children.map(child => renderElementToHtml(child, isExporting)).join('\n');
  }


  switch (element.type) {
    case 'Header':
      return `<header${cls} style="${styleString}" ${attributes}>${element.content || ''}</header>`;
    case 'Footer':
      return `<footer${cls} style="${styleString}" ${attributes}>${element.content || ''}</footer>`;
    case 'Heading1':
      return `<h1${cls} style="${styleString}" ${attributes}>${element.content || ''}</h1>`;
    case 'Heading2':
      return `<h2${cls} style="${styleString}" ${attributes}>${element.content || ''}</h2>`;
    case 'Heading3':
      return `<h3${cls} style="${styleString}" ${attributes}>${element.content || ''}</h3>`;
    case 'Paragraph':
      return `<p${cls} style="${styleString}" ${attributes}>${element.content || ''}</p>`;
    case 'Button': {
      const href = element.props?.href;
      const target = element.props?.target || '_self';
      const hoverCls = element.props?.hoverAnimation ? ` class="${element.props.hoverAnimation}${isExporting ? ' ' + elClass(element.id) : ''}"` : cls;
      if (href) {
        return `<a href="${href}" target="${target}" style="${styleString};text-decoration:none;display:inline-block;"${hoverCls} ${attributes}>${element.content || ''}</a>`;
      }
      return `<button style="${styleString}"${hoverCls} ${attributes}>${element.content || ''}</button>`;
    }
    case 'Image': {
      let imageSrc = element.src || '';
      if (isExporting && imageSrc.startsWith('/secret1/')) {
        const filename = getFilenameFromLocalPath(imageSrc);
        imageSrc = `images/${filename}`;
      }
      return `<img${cls} src="${imageSrc}" alt="${element.alt || ''}" style="${styleString}" ${attributes} />`;
    }
    case 'Container':
      return `<div${cls} style="${styleString}" ${attributes}>${childrenHtml}</div>`;
    default:
      return `<!-- Unknown element type: ${element.type} -->`;
  }
}

function parsePxValue(val: string | number | undefined, fallback = 0): number {
  if (val == null) return fallback;
  if (typeof val === 'number') return val;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

function generatePageHtml(page: SitePage, siteName: string): string {
  const canvasWrapperStyles = cssPropertiesToInlineStyle(page.canvasStyles);

  // Create a deep copy of elements to modify for export, especially Header/Footer content
  const elementsForExport = page.elements.map(el => {
    if ((el.type === "Header" || el.type === "Footer") && el.content) {
      const clonedElement = JSON.parse(JSON.stringify(el)) as CanvasElement;
      clonedElement.content = clonedElement.content!.replace(/href="(\/(?:[^"]*[^/]|))"/g, (match: string, capturedPath: string) => {
        if (capturedPath === "/") return 'href="index.html"';
        const relativePath = capturedPath.substring(1).replace(/\/+$/, '');
        return `href="${relativePath}.html"`;
      });
      return clonedElement;
    }
    return el;
  });

  // Separate Header/Footer from freeform elements
  const headerEl = elementsForExport.find(el => el.type === 'Header');
  const footerEl = elementsForExport.find(el => el.type === 'Footer');
  const freeEls = elementsForExport.filter(el => el.type !== 'Header' && el.type !== 'Footer');

  // Compute desktop min-height for freeform zone
  let freeZoneMinHeight = 600;
  freeEls.forEach((el, i) => {
    const top = parsePxValue(el.styles?.top as string | number, 20 + i * 130);
    const height = parsePxValue(el.styles?.height as string | number, 100);
    freeZoneMinHeight = Math.max(freeZoneMinHeight, top + height + 80);
  });

  // Generate responsive CSS (media queries)
  const { tabletCss, mobileCss, freeZoneTabletMinH, freeZoneMobileMinH } = generateResponsiveCss(page.elements);

  const headerHtml = headerEl ? renderElementToHtml(headerEl, true) : '';
  const footerHtml = footerEl ? renderElementToHtml(footerEl, true) : '';
  const freeHtml = freeEls.map(el => renderElementToHtml(el, true)).join('\n        ');

  // Wrap freeform elements in a positioned container with responsive height
  const freeZoneHtml = freeEls.length > 0
    ? `<div class="pmi-freeform" style="position:relative;min-height:${freeZoneMinHeight}px;">\n        ${freeHtml}\n    </div>`
    : '';

  const elementsHtml = [headerHtml, freeZoneHtml, footerHtml].filter(Boolean).join('\n        ');
  const globalFontFamily = page.canvasStyles?.fontFamily || "Inter, sans-serif";

  const embeddedStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Work+Sans:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Figtree:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600;700&family=Karla:wght@300;400;500;600;700&family=Mulish:wght@300;400;600;700&family=Ubuntu:wght@300;400;500;700&family=Josefin+Sans:wght@300;400;600;700&family=Bebas+Neue&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&family=EB+Garamond:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Cinzel:wght@400;500;600;700&family=PT+Serif:wght@400;700&family=Pacifico&family=Dancing+Script:wght@400;500;600;700&family=Lobster&family=Caveat:wght@400;500;600;700&family=Comfortaa:wght@300;400;500;600;700&family=Abril+Fatface&family=Righteous&family=JetBrains+Mono:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&family=Source+Code+Pro:wght@400;500;600&display=swap');

        /* Dark Theme Variables from globals.css */
        :root {
            --background: 220 15% 12%; 
            --foreground: 210 30% 90%; 
            --card: 220 15% 15%; 
            --card-foreground: 210 30% 90%;
            --popover: 220 15% 14%; 
            --popover-foreground: 210 30% 90%;
            --primary: 210 70% 65%; 
            --primary-foreground: 220 15% 10%; 
            --secondary: 220 15% 22%; 
            --secondary-foreground: 210 30% 80%;
            --muted: 220 15% 25%;
            --muted-foreground: 210 25% 65%;
            --accent: 190 60% 60%; 
            --accent-foreground: 220 15% 10%; 
            --destructive: 0 65% 55%; 
            --destructive-foreground: 0 0% 100%;
            --border: 220 15% 28%;
            --input: 220 15% 18%;
            --ring: 210 70% 65%;
            --radius: 0.5rem;
        }

        *, *::before, *::after {
            box-sizing: border-box;
            border-width: 0;
            border-style: solid;
            border-color: hsl(var(--border));
        }

        html {
            line-height: 1.5;
            -webkit-text-size-adjust: 100%;
            -moz-tab-size: 4;
            tab-size: 4;
            font-family: ${globalFontFamily};
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
        }

        body {
            margin: 0;
            font-family: inherit;
            line-height: inherit;
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
        }

        html, body {
            height: 100%;
        }

        #canvas-wrapper {
            box-sizing: border-box;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .pmi-freeform {
            flex: 1;
        }

        h1, h2, h3, h4, h5, h6, p, button, a, span, div {
            margin: 0;
            padding: 0;
            font-size: inherit;
            font-weight: inherit;
            color: inherit;
            line-height: inherit;
            font-family: inherit;
        }
        a {
            text-decoration: none;
            color: hsl(var(--primary));
        }
        a:hover {
            text-decoration: underline;
        }
        button {
            background-color: transparent;
            background-image: none;
            cursor: pointer;
            border-radius: var(--radius);
            font-family: inherit;
        }
        img, svg, video, canvas, audio, iframe, embed, object {
            display: block;
            vertical-align: middle;
        }
        img, video {
            max-width: 100%;
            height: auto;
        }
        #canvas-wrapper > * {
           margin-bottom: 0;
        }

        /* Tailwind class mappings for Header/Footer */
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .hover\\:underline:hover { text-decoration: underline; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        .text-primary { color: hsl(var(--primary)); }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .text-foreground { color: hsl(var(--foreground)); }
        .mr-3 { margin-right: 0.75rem; }
        .last\\:mr-0:last-child { margin-right: 0; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .w-full { width: 100%; }
        .gap-2 { gap: 0.5rem; }
        .h-8 { height: 2rem; }
        .w-auto { width: auto; }
        .h-7 { height: 1.75rem; }
        .w-7 { width: 1.75rem; }
        .h-6 { height: 1.5rem; }
        .w-6 { width: 1.5rem; }
        .mr-2 { margin-right: 0.5rem; }
        header svg, footer svg {
            stroke: currentColor;
        }
        header svg[fill="none"], footer svg[fill="none"] {
            fill: none;
        }

        /* Responsive freeform zone height */
        ${freeZoneTabletMinH > 600 ? `@media (max-width: 1023px) { .pmi-freeform { min-height: ${freeZoneTabletMinH}px; } }` : ''}
        ${freeZoneMobileMinH > 600 ? `@media (max-width: 767px) { .pmi-freeform { min-height: ${freeZoneMobileMinH}px; } }` : ''}

        /* Tablet overrides */
        ${tabletCss}

        /* Mobile overrides */
        ${mobileCss}
    `;

  const seo = page.seo ?? {};
  const pageTitle = seo.title || `${page.name} - ${siteName}`;
  const seoMeta = [
    seo.description ? `    <meta name="description" content="${seo.description.replace(/"/g, "&quot;")}">` : "",
    seo.keywords    ? `    <meta name="keywords"    content="${seo.keywords.replace(/"/g, "&quot;")}">` : "",
    seo.ogImage     ? `    <meta property="og:image" content="${seo.ogImage.replace(/"/g, "&quot;")}">` : "",
    seo.title       ? `    <meta property="og:title" content="${seo.title.replace(/"/g, "&quot;")}">` : "",
    seo.description ? `    <meta property="og:description" content="${seo.description.replace(/"/g, "&quot;")}">` : "",
  ].filter(Boolean).join("\n");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
${seoMeta}
    <style>
        ${embeddedStyles}
    </style>
</head>
<body>
    <div id="canvas-wrapper" style="${canvasWrapperStyles}">
        ${elementsHtml}
    </div>
</body>
</html>`;
}

export async function exportSiteToZip(siteData: SiteData): Promise<void> {
  const zip = new JSZip();
  const imagesFolder = zip.folder("images");
  const localImagePaths = new Set<string>();

  siteData.pages.forEach(page => {
    function collectImagePathsRecursive(elements: CanvasElement[]) {
      elements.forEach(element => {
        if (element.type === 'Image' && element.src?.startsWith('/secret1/')) {
          localImagePaths.add(element.src);
        }
        if (element.children) {
          collectImagePathsRecursive(element.children);
        }
      });
    }
    collectImagePathsRecursive(page.elements);
  });

  const imagePromises: Promise<void>[] = [];
  if (localImagePaths.size > 0 && imagesFolder) {
    localImagePaths.forEach(imagePath => {
      const filename = getFilenameFromLocalPath(imagePath);
      const fetchUrl = imagePath; 

      imagePromises.push(
        fetch(fetchUrl)
          .then(response => {
            if (!response.ok) {
              console.warn(`Failed to fetch image ${fetchUrl}: ${response.statusText}. It will not be included in the ZIP.`);
              return null; 
            }
            return response.blob();
          })
          .then(blob => {
            if (blob && imagesFolder) { 
              imagesFolder.file(filename, blob);
            }
          })
          .catch(error => {
            console.error(`Error fetching or adding image ${imagePath} to ZIP:`, error);
          })
      );
    });
    await Promise.all(imagePromises);
  }

  siteData.pages.forEach(page => {
    const pageHtml = generatePageHtml(page, siteData.siteName);
    let fileName = (page.path === '/' || page.path === '') ? 'index' : page.path.substring(1).replace(/\/+$/, '');
    
    if (fileName.includes('/')) {
        const parts = fileName.split('/');
        let currentFolder = zip;
        for (let i = 0; i < parts.length - 1; i++) {
            currentFolder = currentFolder.folder(parts[i]) || currentFolder; 
        }
        fileName = parts[parts.length -1];
         if (!fileName.includes('.')) {
          fileName += '.html';
        }
        currentFolder.file(fileName, pageHtml);
    } else {
        if (!fileName.includes('.')) {
          fileName += '.html';
        }
        zip.file(fileName, pageHtml);
    }
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  const siteNameKebab = siteData.siteName ? toKebabCase(siteData.siteName) : 'my-site';
  link.download = `${siteNameKebab || 'exported-site'}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
