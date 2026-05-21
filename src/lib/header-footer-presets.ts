import type { SitePage } from "@/types/canvas-element";
import type { CSSProperties } from "react";

export interface HeaderFooterPreset {
  id: string;
  name: string;
  previewHtml: string; // mini SVG/HTML thumbnail
  styles: CSSProperties;
}

const BASE_STYLES: CSSProperties = {
  backgroundColor: "rgba(8,12,20,0.95)",
  padding: "14px 28px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid rgba(99,139,255,0.18)",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box",
};

export const HEADER_PRESETS: HeaderFooterPreset[] = [
  {
    id: "standard",
    name: "Стандарт",
    previewHtml: `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="36" fill="#080c14"/>
      <rect x="10" y="14" width="8" height="8" rx="2" fill="#638bff"/>
      <rect x="22" y="15" width="28" height="6" rx="2" fill="#e8eaf6" opacity=".8"/>
      <rect x="90" y="15" width="16" height="6" rx="2" fill="#638bff" opacity=".7"/>
      <rect x="112" y="15" width="6" height="6" rx="1" fill="rgba(99,139,255,.2)"/>
      <rect x="122" y="15" width="16" height="6" rx="2" fill="rgba(232,234,246,.35)"/>
    </svg>`,
    styles: BASE_STYLES,
  },
  {
    id: "with-buttons",
    name: "С кнопками",
    previewHtml: `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="36" fill="#080c14"/>
      <rect x="10" y="14" width="8" height="8" rx="2" fill="#638bff"/>
      <rect x="22" y="15" width="24" height="6" rx="2" fill="#e8eaf6" opacity=".8"/>
      <rect x="62" y="15" width="16" height="6" rx="2" fill="rgba(232,234,246,.4)"/>
      <rect x="82" y="15" width="6" height="6" rx="1" fill="rgba(99,139,255,.2)"/>
      <rect x="92" y="15" width="16" height="6" rx="2" fill="rgba(232,234,246,.4)"/>
      <rect x="114" y="13" width="18" height="10" rx="3" fill="rgba(99,139,255,.25)" stroke="rgba(99,139,255,.4)" stroke-width="1"/>
      <rect x="136" y="13" width="18" height="10" rx="3" fill="#638bff"/>
    </svg>`,
    styles: BASE_STYLES,
  },
  {
    id: "centered",
    name: "По центру",
    previewHtml: `<svg viewBox="0 0 160 44" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="44" fill="#080c14"/>
      <rect x="64" y="6" width="8" height="8" rx="2" fill="#638bff"/>
      <rect x="76" y="7" width="20" height="6" rx="2" fill="#e8eaf6" opacity=".8"/>
      <rect x="38" y="26" width="16" height="5" rx="2" fill="rgba(232,234,246,.4)"/>
      <rect x="58" y="26" width="6" height="5" rx="1" fill="rgba(99,139,255,.2)"/>
      <rect x="68" y="26" width="16" height="5" rx="2" fill="rgba(232,234,246,.4)"/>
      <rect x="88" y="26" width="6" height="5" rx="1" fill="rgba(99,139,255,.2)"/>
      <rect x="98" y="26" width="16" height="5" rx="2" fill="rgba(232,234,246,.4)"/>
    </svg>`,
    styles: { ...BASE_STYLES, padding: "10px 28px", minHeight: "72px", alignItems: "center" },
  },
  {
    id: "split",
    name: "Разделённый",
    previewHtml: `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="36" fill="#080c14"/>
      <rect x="10" y="14" width="8" height="8" rx="2" fill="#638bff"/>
      <rect x="22" y="15" width="24" height="6" rx="2" fill="#e8eaf6" opacity=".8"/>
      <rect x="58" y="14" width="1" height="8" fill="rgba(99,139,255,.25)"/>
      <rect x="64" y="15" width="16" height="6" rx="2" fill="rgba(232,234,246,.4)"/>
      <rect x="84" y="15" width="16" height="6" rx="2" fill="rgba(232,234,246,.4)"/>
      <rect x="104" y="15" width="16" height="6" rx="2" fill="rgba(232,234,246,.4)"/>
      <rect x="125" y="13" width="24" height="10" rx="3" fill="#638bff"/>
    </svg>`,
    styles: BASE_STYLES,
  },
];

export const FOOTER_PRESETS: HeaderFooterPreset[] = [
  {
    id: "minimal",
    name: "Минимальный",
    previewHtml: `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="36" fill="#060910"/>
      <rect x="10" y="15" width="50" height="5" rx="2" fill="rgba(232,234,246,.3)"/>
      <rect x="100" y="15" width="14" height="5" rx="2" fill="#638bff" opacity=".7"/>
      <rect x="118" y="15" width="6" height="5" rx="1" fill="rgba(99,139,255,.2)"/>
      <rect x="128" y="15" width="20" height="5" rx="2" fill="rgba(232,234,246,.3)"/>
    </svg>`,
    styles: {
      backgroundColor: "rgba(6,9,16,0.98)",
      padding: "16px 28px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTop: "1px solid rgba(99,139,255,0.12)",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },
  },
  {
    id: "centered",
    name: "По центру",
    previewHtml: `<svg viewBox="0 0 160 44" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="44" fill="#060910"/>
      <rect x="54" y="8" width="14" height="5" rx="2" fill="#638bff" opacity=".7"/>
      <rect x="72" y="8" width="6" height="5" rx="1" fill="rgba(99,139,255,.2)"/>
      <rect x="82" y="8" width="20" height="5" rx="2" fill="rgba(232,234,246,.3)"/>
      <rect x="40" y="24" width="80" height="5" rx="2" fill="rgba(232,234,246,.2)"/>
    </svg>`,
    styles: {
      backgroundColor: "rgba(10,14,28,0.98)",
      padding: "28px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTop: "1px solid rgba(99,139,255,0.15)",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },
  },
  {
    id: "multicolumn",
    name: "Колонки",
    previewHtml: `<svg viewBox="0 0 160 52" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="52" fill="#080c14"/>
      <rect x="10" y="10" width="8" height="8" rx="2" fill="#638bff"/>
      <rect x="22" y="11" width="20" height="6" rx="2" fill="#e8eaf6" opacity=".6"/>
      <rect x="10" y="24" width="40" height="4" rx="2" fill="rgba(232,234,246,.2)"/>
      <rect x="10" y="32" width="30" height="4" rx="2" fill="rgba(232,234,246,.2)"/>
      <rect x="72" y="10" width="24" height="4" rx="2" fill="rgba(232,234,246,.5)"/>
      <rect x="72" y="20" width="18" height="3" rx="1" fill="rgba(232,234,246,.25)"/>
      <rect x="72" y="27" width="18" height="3" rx="1" fill="rgba(232,234,246,.25)"/>
      <rect x="72" y="34" width="18" height="3" rx="1" fill="rgba(232,234,246,.25)"/>
      <rect x="118" y="10" width="24" height="4" rx="2" fill="rgba(232,234,246,.5)"/>
      <rect x="118" y="20" width="20" height="3" rx="1" fill="rgba(232,234,246,.25)"/>
      <rect x="118" y="27" width="16" height="3" rx="1" fill="rgba(232,234,246,.25)"/>
      <line x1="10" y1="46" x2="150" y2="46" stroke="rgba(99,139,255,.15)" stroke-width="1"/>
    </svg>`,
    styles: {
      backgroundColor: "rgba(8,12,20,0.98)",
      padding: "0",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTop: "1px solid rgba(99,139,255,0.15)",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },
  },
  {
    id: "dark",
    name: "Тёмный",
    previewHtml: `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="36" fill="#020408"/>
      <rect x="10" y="15" width="8" height="8" rx="2" fill="#638bff" opacity=".5"/>
      <rect x="22" y="16" width="20" height="5" rx="2" fill="rgba(232,234,246,.25)"/>
      <rect x="100" y="16" width="14" height="5" rx="2" fill="#638bff" opacity=".5"/>
      <rect x="118" y="16" width="6" height="5" rx="1" fill="rgba(99,139,255,.15)"/>
      <rect x="128" y="16" width="20" height="5" rx="2" fill="rgba(232,234,246,.2)"/>
    </svg>`,
    styles: {
      background: "linear-gradient(180deg, #050a14 0%, #020408 100%)",
      padding: "16px 28px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTop: "1px solid rgba(99,139,255,0.08)",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },
  },
];

// ─── HTML GENERATORS ───

function navLinks(pages: SitePage[], activePath: string, color = "rgba(232,234,246,0.65)", activeColor = "#638bff") {
  return pages.map(p => {
    const isActive = p.path === activePath;
    return `<a href="${p.path.startsWith("/") ? p.path : "/" + p.path}" style="color:${isActive ? activeColor : color};font-weight:${isActive ? "600" : "400"};font-size:14px;text-decoration:none;">${p.name}</a>`;
  }).join('<span style="margin:0 10px;color:rgba(99,139,255,0.25);">|</span>');
}

function logoBlock(siteName: string, iconColor = "#638bff", siteNameColor = "#e8eaf6") {
  return `<a href="/" style="display:flex;align-items:center;gap:6px;text-decoration:none;flex-shrink:0;">
    <svg style="color:${iconColor};width:26px;height:26px;flex-shrink:0;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
    <span style="color:${siteNameColor};font-size:18px;font-weight:700;letter-spacing:-0.3px;white-space:nowrap;">${siteName}</span>
  </a>`;
}

export function buildHeaderHtml(
  styleId: string,
  pages: SitePage[],
  siteName: string,
  activePath: string,
  props?: Record<string, any>
): string {
  const iconColor = props?.headerIconColor || "#638bff";
  const siteNameColor = props?.headerSiteNameColor || "#e8eaf6";
  const logo = logoBlock(siteName, iconColor, siteNameColor);
  const nav = navLinks(pages, activePath);

  switch (styleId) {
    default:
    case "standard":
      return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;width:100%;gap:8px;">
        ${logo}
        <nav data-placeholder="page-nav-links" style="display:flex;align-items:center;gap:0;flex-shrink:0;">${nav}</nav>
      </div>`;

    case "with-buttons":
      return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;width:100%;gap:8px;">
        ${logo}
        <nav data-placeholder="page-nav-links" style="display:flex;align-items:center;gap:0;flex-shrink:0;">${nav}</nav>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <a href="/login" style="color:rgba(232,234,246,0.7);font-size:13px;text-decoration:none;padding:6px 14px;border:1px solid rgba(99,139,255,0.3);border-radius:8px;white-space:nowrap;">Войти</a>
          <a href="/register" style="background:linear-gradient(135deg,#3b7fff,#638bff);color:#fff;font-size:13px;font-weight:600;text-decoration:none;padding:6px 16px;border-radius:8px;white-space:nowrap;">Начать →</a>
        </div>
      </div>`;

    case "centered":
      return `<div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:10px;">
        ${logo}
        <nav data-placeholder="page-nav-links" style="display:flex;align-items:center;gap:0;">${nav}</nav>
      </div>`;

    case "split":
      return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;width:100%;gap:8px;">
        <div style="display:flex;align-items:center;gap:0;padding-right:16px;border-right:1px solid rgba(99,139,255,0.2);">
          ${logo}
        </div>
        <nav data-placeholder="page-nav-links" style="display:flex;align-items:center;gap:0;flex:1;padding:0 16px;">${nav}</nav>
        <a href="/start" style="background:linear-gradient(135deg,#3b7fff,#638bff);color:#fff;font-size:13px;font-weight:600;text-decoration:none;padding:8px 20px;border-radius:8px;white-space:nowrap;flex-shrink:0;">Попробовать</a>
      </div>`;
  }
}

export function buildFooterHtml(
  styleId: string,
  pages: SitePage[],
  siteName: string,
  activePath: string,
  copyrightText?: string
): string {
  const year = new Date().getFullYear();
  const copyright = copyrightText || `&copy; ${year} ${siteName}. Все права защищены.`;
  const nav = navLinks(pages, activePath);

  switch (styleId) {
    default:
    case "minimal":
      return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;width:100%;gap:8px 16px;">
        <p style="color:rgba(232,234,246,0.45);font-size:12px;margin:0;white-space:nowrap;">${copyright}</p>
        <nav data-placeholder="page-footer-nav-links" style="display:flex;align-items:center;gap:0;flex-shrink:0;">${nav}</nav>
      </div>`;

    case "dark":
      return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;width:100%;gap:8px 16px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <svg style="color:#638bff;width:18px;height:18px;opacity:.6;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          <p style="color:rgba(232,234,246,0.3);font-size:12px;margin:0;">${copyright}</p>
        </div>
        <nav data-placeholder="page-footer-nav-links" style="display:flex;align-items:center;gap:0;flex-shrink:0;">${nav}</nav>
      </div>`;

    case "centered":
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;">
        <nav data-placeholder="page-footer-nav-links" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 0;">${nav}</nav>
        <p style="color:rgba(232,234,246,0.4);font-size:12px;margin:0;text-align:center;">${copyright}</p>
      </div>`;

    case "multicolumn":
      return `<div style="width:100%;padding:40px 48px;box-sizing:border-box;">
        <div style="display:flex;flex-wrap:wrap;gap:40px;margin-bottom:32px;">
          <div style="flex:2;min-width:200px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <svg style="color:#638bff;width:22px;height:22px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span style="color:#e8eaf6;font-size:16px;font-weight:700;">${siteName}</span>
            </div>
            <p style="color:rgba(232,234,246,0.45);font-size:13px;line-height:1.6;margin:0;max-width:280px;">Создавайте красивые сайты без кода с помощью нашего визуального конструктора.</p>
          </div>
          <div style="flex:1;min-width:140px;">
            <p style="color:#e8eaf6;font-size:13px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">Страницы</p>
            <div data-placeholder="page-footer-nav-links" style="display:flex;flex-direction:column;gap:8px;">
              ${pages.map(p => `<a href="${p.path.startsWith("/") ? p.path : "/" + p.path}" style="color:rgba(232,234,246,0.5);font-size:13px;text-decoration:none;">${p.name}</a>`).join("")}
            </div>
          </div>
          <div style="flex:1;min-width:140px;">
            <p style="color:#e8eaf6;font-size:13px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">Контакты</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <a href="mailto:info@example.com" style="color:rgba(232,234,246,0.5);font-size:13px;text-decoration:none;">info@example.com</a>
              <a href="tel:+79001234567" style="color:rgba(232,234,246,0.5);font-size:13px;text-decoration:none;">+7 (900) 123-45-67</a>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid rgba(99,139,255,0.12);padding-top:20px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
          <p style="color:rgba(232,234,246,0.35);font-size:12px;margin:0;">${copyright}</p>
          <p style="color:rgba(232,234,246,0.2);font-size:12px;margin:0;">Создано в PagesMi</p>
        </div>
      </div>`;
  }
}
