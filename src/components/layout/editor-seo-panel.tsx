"use client";
import { Globe, Image as ImageIcon, Tag, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SeoData } from "@/types/canvas-element";

const inputStyle = {
  background: "rgba(15,22,48,0.6)",
  borderColor: "rgba(99,139,255,0.25)",
  color: "var(--text-primary)",
  fontSize: "12px",
};

interface Props {
  seo: SeoData;
  pageName: string;
  onChange: (seo: SeoData) => void;
}

export default function EditorSeoPanel({ seo, pageName, onChange }: Props) {
  const set = (key: keyof SeoData, val: string) => onChange({ ...seo, [key]: val });

  const titleLen = (seo.title || "").length;
  const descLen = (seo.description || "").length;

  return (
    <div className="glass-scroll h-full overflow-y-auto" style={{ padding: "12px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Globe size={14} style={{ color: "#638bff" }} />
        <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>
          SEO — {pageName}
        </span>
      </div>

      {/* Preview */}
      <div style={{
        background: "rgba(15,22,48,0.5)", border: "1px solid rgba(99,139,255,0.15)",
        borderRadius: 10, padding: "12px 14px", marginBottom: 16,
      }}>
        <p style={{ color: "#638bff", fontSize: 14, fontWeight: 600, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {seo.title || pageName || "Заголовок страницы"}
        </p>
        <p style={{ color: "#10b981", fontSize: 11, margin: "0 0 4px" }}>
          yourdomain.com
        </p>
        <p style={{ color: "rgba(232,234,246,0.55)", fontSize: 12, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
          {seo.description || "Описание страницы появится здесь..."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <Label className="text-xs" style={{ color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
            <span><Tag size={10} className="inline mr-1" />Title</span>
            <span style={{ color: titleLen > 60 ? "#ef4444" : titleLen > 50 ? "#f59e0b" : "var(--text-muted)" }}>{titleLen}/60</span>
          </Label>
          <Input value={seo.title || ""} onChange={e => set("title", e.target.value)}
            placeholder="Заголовок для поисковиков" className="mt-1 text-xs h-8" style={inputStyle} />
        </div>

        <div>
          <Label className="text-xs" style={{ color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
            <span><FileText size={10} className="inline mr-1" />Description</span>
            <span style={{ color: descLen > 160 ? "#ef4444" : descLen > 140 ? "#f59e0b" : "var(--text-muted)" }}>{descLen}/160</span>
          </Label>
          <Textarea value={seo.description || ""} onChange={e => set("description", e.target.value)}
            placeholder="Краткое описание страницы для Google" className="mt-1 text-xs" rows={3}
            style={{ ...inputStyle, resize: "none" }} />
        </div>

        <div>
          <Label className="text-xs" style={{ color: "var(--text-secondary)" }}>
            <Tag size={10} className="inline mr-1" />Keywords
          </Label>
          <Input value={seo.keywords || ""} onChange={e => set("keywords", e.target.value)}
            placeholder="ключевое слово, ещё одно" className="mt-1 text-xs h-8" style={inputStyle} />
        </div>

        <div>
          <Label className="text-xs" style={{ color: "var(--text-secondary)" }}>
            <ImageIcon size={10} className="inline mr-1" />OG Image URL
          </Label>
          <Input value={seo.ogImage || ""} onChange={e => set("ogImage", e.target.value)}
            placeholder="https://..." className="mt-1 text-xs h-8" style={inputStyle} />
          {seo.ogImage && (
            <img src={seo.ogImage} alt="og preview" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, marginTop: 6, border: "1px solid rgba(99,139,255,0.2)" }} />
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(99,139,255,0.06)", borderRadius: 8, border: "1px solid rgba(99,139,255,0.12)" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, lineHeight: 1.6 }}>
          💡 Title 50–60 символов, description 140–160. Данные добавляются в <code style={{ color: "#638bff" }}>&lt;head&gt;</code> при экспорте.
        </p>
      </div>
    </div>
  );
}
