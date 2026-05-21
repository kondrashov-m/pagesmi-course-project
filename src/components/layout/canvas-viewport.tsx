"use client";

import { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Monitor, Tablet, Smartphone } from "lucide-react";

type DeviceView = "desktop" | "tablet" | "mobile";
interface Props { deviceView: DeviceView; children: React.ReactNode; }

const META = {
  desktop: { label: "Десктоп",   Icon: Monitor,    color: "#638bff" },
  tablet:  { label: "Планшет",   Icon: Tablet,     color: "#f59e0b" },
  mobile:  { label: "Мобильный", Icon: Smartphone, color: "#10b981" },
};

const FIXED_W: Partial<Record<DeviceView, number>> = { tablet: 768, mobile: 375 };

export default function CanvasViewport({ deviceView, children }: Props) {
  const [zoom, setZoom]   = useState(1);
  const [vpW,  setVpW]    = useState(0);   // ширина вьюпорта (скролл-контейнера)
  const [natH, setNatH]   = useState(0);   // высота холста до масштаба

  const vpRef     = useRef<HTMLDivElement>(null);  // скролл-контейнер
  const canvasRef = useRef<HTMLDivElement>(null);  // обёртка холста

  /* ── Измеряем ширину вьюпорта ───────────────────────────────────── */
  useEffect(() => {
    const ro = new ResizeObserver(e => setVpW(e[0].contentRect.width));
    if (vpRef.current) ro.observe(vpRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── Измеряем натуральную высоту холста ─────────────────────────── */
  useEffect(() => {
    const ro = new ResizeObserver(e => setNatH(e[0].contentRect.height));
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── Сбрасываем зум при смене устройства ───────────────────────── */
  useEffect(() => {
    setZoom(1);
    vpRef.current?.scrollTo(0, 0);
  }, [deviceView]);

  /* ── Ctrl+Scroll → зум канваса (перехватываем браузерный зум) ───── */
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => +Math.max(0.25, Math.min(2, z + delta)).toFixed(2));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zi = () => setZoom(z => +Math.min(2,    z + 0.1).toFixed(2));
  const zo = () => setZoom(z => +Math.max(0.25, z - 0.1).toFixed(2));

  const meta   = META[deviceView];
  /* Натуральная ширина холста: для планшета/мобильного — фиксированная,
     для десктопа — измеренная ширина вьюпорта (при zoom=1 холст заполняет весь экран) */
  const natW   = FIXED_W[deviceView] ?? vpW;

  /* Визуальные размеры (после масштаба) */
  const visW = natW * zoom;
  const visH = natH * zoom;

  /* Отступы вокруг холста (только для устройств) */
  const PAD = deviceView !== "desktop" ? 24 : 0;

  /* Размер сайзера — управляет полосами прокрутки */
  const sizerW = Math.max(visW + PAD * 2, vpW || visW);
  const sizerH = visH + PAD * 2;

  /* Горизонтальное центрирование холста внутри сайзера */
  const canvasX = Math.max(0, (sizerW - visW) / 2);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

      {/* ── Тулбар ─────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, padding: "4px 8px",
        borderBottom: "1px solid rgba(99,139,255,0.08)",
        background: "rgba(8,12,20,0.6)",
      }}>
        {/* Метка устройства */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 11, fontWeight: 600, color: meta.color,
          padding: "2px 8px", borderRadius: 6,
          background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
          marginRight: 8,
        }}>
          <meta.Icon size={11} />
          {meta.label}
          {FIXED_W[deviceView] && (
            <span style={{ opacity: 0.6, fontWeight: 400 }}>— {FIXED_W[deviceView]}px</span>
          )}
        </div>

        {/* Кнопки зума */}
        <button onClick={zo} disabled={zoom <= 0.25}
          style={{ ...btnSt, opacity: zoom <= 0.25 ? 0.3 : 1 }} title="Уменьшить (−)">
          <ZoomOut size={13} />
        </button>
        <button onClick={() => setZoom(1)}
          style={{ ...btnSt, minWidth: 44, fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}
          title="Сбросить масштаб (клик)">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zi} disabled={zoom >= 2}
          style={{ ...btnSt, opacity: zoom >= 2 ? 0.3 : 1 }} title="Увеличить (+)">
          <ZoomIn size={13} />
        </button>
      </div>

      {/* ── Вьюпорт со скроллом ────────────────────────────────────── */}
      <div
        ref={vpRef}
        style={{
          flex: 1, overflow: "auto",
          backgroundColor: "#06091280",
          backgroundImage: "radial-gradient(circle, rgba(99,139,255,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Сайзер: его размеры = визуальные размеры холста → корректные полосы прокрутки */}
        <div style={{
          position: "relative",
          width:  sizerW,
          height: Math.max(sizerH, 1),
          minHeight: "100%",
        }}>
          {/* Контейнер холста — позиционируем абсолютно, чтобы не влиял на сайзер */}
          <div style={{
            position: "absolute",
            top:  PAD,
            left: canvasX,
            /* overflow:hidden обрезает layout-хвост transform: scale при уменьшении */
            width:    visW,
            height:   visH,
            overflow: "hidden",
          }}>
            <div
              ref={canvasRef}
              style={{
                width: natW || "100%",
                transformOrigin: "top left",
                transform: `scale(${zoom})`,
                /* Тень + скругление для планшета/мобильного */
                ...(deviceView !== "desktop" ? {
                  boxShadow: "0 0 0 1px rgba(99,139,255,0.18), 0 16px 48px rgba(0,0,0,0.65)",
                  borderRadius: deviceView === "mobile" ? 28 : 8,
                  overflow: "hidden",
                } : {}),
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnSt: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "3px 6px", borderRadius: 6,
  border: "1px solid rgba(99,139,255,0.2)", background: "rgba(99,139,255,0.08)",
  color: "rgba(99,139,255,0.85)", cursor: "pointer", transition: "all 0.15s",
};
