"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Layers, Layout, Settings, Monitor, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: <Sparkles className="w-8 h-8" style={{ color: "#638bff" }} />,
    title: "Добро пожаловать в PagesMi",
    desc: "PagesMi - это визуальный конструктор сайтов без кода, созданный kondrashov-m",
    tip: null,
  },
  {
    icon: <Layers className="w-8 h-8" style={{ color: "#638bff" }} />,
    title: "Левая панель — добавление блоков",
    desc: "Здесь три вкладки:",
    tip: [
      { label: "Блоки", text: "готовые секции — герой, команда, тарифы и другие" },
      { label: "Шаблоны", text: "целые страницы в один клик: лендинг, портфолио, ресторан" },
      { label: "Холст", text: "настройки фона и сетки страницы" },
    ],
  },
  {
    icon: <Layout className="w-8 h-8" style={{ color: "#638bff" }} />,
    title: "Холст — редактируй всё что видишь",
    desc: "Кликни на любой элемент чтобы выбрать его. Появится панель управления — можно перемещать, копировать, удалять или редактировать текст двойным кликом.",
    tip: null,
  },
  {
    icon: <Settings className="w-8 h-8" style={{ color: "#638bff" }} />,
    title: "Правая панель — настройки",
    desc: "Здесь две вкладки:",
    tip: [
      { label: "Элемент", text: "цвет, размер, шрифт, анимации выбранного блока" },
      { label: "Страницы", text: "управление страницами сайта и настройки проекта" },
    ],
  },
  {
    icon: <Monitor className="w-8 h-8" style={{ color: "#638bff" }} />,
    title: "Верхняя панель — финальные действия",
    desc: "В шапке редактора:",
    tip: [
      { label: "Десктоп / Планшет / Мобильный", text: "предпросмотр на разных устройствах" },
      { label: "Ctrl+Z / Ctrl+Y", text: "отмена и повтор действий" },
      { label: "Сохранить", text: "сохранить проект в браузере" },
      { label: "Экспорт", text: "скачать готовый HTML-сайт" },
    ],
  },
];

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const close = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setStep(0);
    }, 300);
  };

  const next = () => step < STEPS.length - 1 && setStep(s => s + 1);
  const prev = () => step > 0 && setStep(s => s - 1);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(4,6,14,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 480,
          background: "rgba(10,14,30,0.95)",
          border: "1px solid rgba(99,139,255,0.25)",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,139,255,0.1)",
          padding: "36px 40px 28px",
          position: "relative",
          transform: leaving ? "scale(0.96)" : "scale(1)",
          transition: "transform 0.3s ease",
          animation: "pmi-zoomIn 0.3s ease both",
        }}
      >
       

        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                height: 4, borderRadius: 2, cursor: "pointer",
                flex: i === step ? 2 : 1,
                background: i === step ? "#638bff" : "rgba(99,139,255,0.2)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, marginBottom: 20,
          background: "rgba(99,139,255,0.1)", border: "1px solid rgba(99,139,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {current.icon}
        </div>

        {/* Content */}
        <h2 style={{ color: "#e8eaf6", fontSize: 20, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
          {current.title}
        </h2>
        <p style={{ color: "rgba(232,234,246,0.6)", fontSize: 14, lineHeight: 1.7, marginBottom: current.tip ? 16 : 0 }}>
          {current.desc}
        </p>

        {current.tip && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {current.tip.map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(99,139,255,0.07)", border: "1px solid rgba(99,139,255,0.15)",
              }}>
                <span style={{
                  flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#638bff",
                  background: "rgba(99,139,255,0.15)", borderRadius: 5,
                  padding: "2px 8px", marginTop: 1,
                }}>
                  {t.label}
                </span>
                <span style={{ color: "rgba(232,234,246,0.55)", fontSize: 13, lineHeight: 1.5 }}>{t.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <button
            onClick={prev}
            disabled={step === 0}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "8px 16px", borderRadius: 10,
              background: "transparent", border: "1px solid rgba(99,139,255,0.2)",
              color: step === 0 ? "rgba(232,234,246,0.2)" : "rgba(232,234,246,0.6)",
              fontSize: 13, cursor: step === 0 ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <ChevronLeft size={14} /> Назад
          </button>

          <span style={{ color: "rgba(232,234,246,0.3)", fontSize: 12 }}>
            {step + 1} / {STEPS.length}
          </span>

          {isLast ? (
            <button
              onClick={close}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "8px 20px", borderRadius: 10,
                background: "linear-gradient(135deg,#3b7fff,#638bff)",
                border: "none", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Начать <Sparkles size={13} />
            </button>
          ) : (
            <button
              onClick={next}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "8px 16px", borderRadius: 10,
                background: "linear-gradient(135deg,#3b7fff,#638bff)",
                border: "none", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Далее <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={close}
          style={{
            display: "block", margin: "16px auto 0",
            background: "none", border: "none",
            color: "rgba(232,234,246,0.25)", fontSize: 12,
            cursor: "pointer", textDecoration: "underline",
            textDecorationStyle: "dotted",
          }}
        >
          Пропустить
        </button>
      </div>
    </div>
  );
}
