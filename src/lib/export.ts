
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

function renderElementToHtml(element: CanvasElement, isExporting: boolean): string {
  const styleString = cssPropertiesToInlineStyle(element.styles);
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

  let childrenHtml = '';
  if (element.type === 'Container' && element.children && element.children.length > 0) {
    childrenHtml = element.children.map(child => renderElementToHtml(child, isExporting)).join('\n');
  } else if (element.type === 'Container' && (!element.children || element.children.length === 0)) {
    // childrenHtml = '<!-- Empty Container -->'; 
  }


  switch (element.type) {
    case 'Header':
      return `<header style="${styleString}" ${attributes}>${element.content || ''}</header>`;
    case 'Footer':
      return `<footer style="${styleString}" ${attributes}>${element.content || ''}</footer>`;
    case 'Heading1':
      return `<h1 style="${styleString}" ${attributes}>${element.content || ''}</h1>`;
    case 'Heading2':
      return `<h2 style="${styleString}" ${attributes}>${element.content || ''}</h2>`;
    case 'Heading3':
      return `<h3 style="${styleString}" ${attributes}>${element.content || ''}</h3>`;
    case 'Paragraph':
      return `<p style="${styleString}" ${attributes}>${element.content || ''}</p>`;
    case 'Button':
      return `<button style="${styleString}" ${attributes}>${element.content || ''}</button>`;
    case 'Image':
      let imageSrc = element.src || '';
      if (isExporting && imageSrc.startsWith('/secret1/')) {
        const filename = getFilenameFromLocalPath(imageSrc);
        imageSrc = `images/${filename}`; 
      }
      return `<img src="${imageSrc}" alt="${element.alt || ''}" style="${styleString}" ${attributes} />`;
    case 'Container':
      return `<div style="${styleString}" ${attributes}>${childrenHtml}</div>`;
    default:
      return `<!-- Unknown element type: ${element.type} -->`;
  }
}

function generatePageHtml(page: SitePage, siteName: string): string {
  const canvasWrapperStyles = cssPropertiesToInlineStyle(page.canvasStyles);

  // Create a deep copy of elements to modify for export, especially Header/Footer content
  const elementsForExport = page.elements.map(el => {
    if ((el.type === "Header" || el.type === "Footer") && el.content) {
      const clonedElement = JSON.parse(JSON.stringify(el)) as CanvasElement; // Deep clone
      // Regex to find href="/some/path" or href="/"
      // It must not match external links (http/https) or mailto or # links
      clonedElement.content = clonedElement.content!.replace(/href="(\/(?:[^"]*[^/]|))"/g, (match: string, capturedPath: string) => {
        if (capturedPath === "/") {
          return 'href="index.html"';
        }
        // Remove leading slash for relative path, add .html
        const relativePath = capturedPath.substring(1).replace(/\/+$/, ''); // remove leading and trailing slashes
        return `href="${relativePath}.html"`;
      });
      return clonedElement;
    }
    return el;
  });

  const elementsHtml = elementsForExport.map(el => renderElementToHtml(el, true)).join('\n        ');
  const globalFontFamily = page.canvasStyles?.fontFamily || "Inter, sans-serif";

  const embeddedStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

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

        #canvas-wrapper {
            box-sizing: border-box;
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
            fill: currentColor;
        }
    `;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.name} - ${siteName}</title>
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
