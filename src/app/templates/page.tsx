"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SquarePen, Zap, ShoppingBag, BookOpen, Coffee, Briefcase, Image } from "lucide-react";

const TEMPLATES = [
  {
    id: "business",
    name: "Бизнес-сайт",
    description: "Профессиональный сайт для компании с секцией услуг, командой и контактами.",
    icon: Briefcase,
    color: "#3b7fff",
    gradient: "linear-gradient(135deg, #1a2e6e, #0d1a40)",
    tags: ["Корпоративный", "Услуги"],
  },
  {
    id: "portfolio",
    name: "Портфолио",
    description: "Личная страница для демонстрации проектов, навыков и опыта.",
    icon: Image,
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #2d1b69, #1a0e40)",
    tags: ["Личный", "Творческий"],
  },
  {
    id: "landing",
    name: "Лендинг",
    description: "Продающая страница с ярким заголовком, преимуществами и призывом к действию.",
    icon: Zap,
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #3d2800, #1f1400)",
    tags: ["Маркетинг", "Продажи"],
  },
  {
    id: "shop",
    name: "Интернет-магазин",
    description: "Каталог товаров с карточками, фильтрами и кнопками заказа.",
    icon: ShoppingBag,
    color: "#10b981",
    gradient: "linear-gradient(135deg, #0d3321, #061a11)",
    tags: ["Торговля", "Каталог"],
  },
  {
    id: "blog",
    name: "Блог",
    description: "Страница для публикации статей и новостей с удобной навигацией.",
    icon: BookOpen,
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #3d0f0f, #1f0606)",
    tags: ["Контент", "Статьи"],
  },
  {
    id: "restaurant",
    name: "Ресторан / Кафе",
    description: "Стильная страница заведения с меню, галереей и формой бронирования.",
    icon: Coffee,
    color: "#f97316",
    gradient: "linear-gradient(135deg, #3d1f00, #1f0f00)",
    tags: ["Общепит", "Меню"],
  },
];

export default function TemplatesPage() {
  const router = useRouter();

  const handleUseTemplate = (templateId: string) => {
    localStorage.setItem("pagesmi_pending_template", templateId);
    router.push("/");
  };

  const glassCard: React.CSSProperties = {
    background: "var(--glass-bg)",
    border: "1px solid rgba(99,139,255,0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "1rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
    cursor: "default",
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #080C14 0%, #0d1526 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-4 px-6 h-14" style={{ background: "rgba(8,12,20,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,139,255,0.12)" }}>
        <Link href="/" className="flex items-center gap-2">
          <SquarePen className="h-5 w-5" style={{ color: "#638bff" }} />
          <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>PagesMi</span>
        </Link>
        <div className="flex-1" />
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" /> В редактор
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Шаблоны сайтов
          </h1>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            Выберите готовый шаблон и начните редактировать прямо сейчас
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div key={tpl.id} style={glassCard} className="group hover:border-[rgba(99,139,255,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] flex flex-col">
                {/* Preview area */}
                <div className="h-40 flex items-center justify-center relative" style={{ background: tpl.gradient }}>
                  {/* Fake mockup lines */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 24px)" }} />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: `${tpl.color}22`, border: `1px solid ${tpl.color}44` }}>
                      <Icon className="h-7 w-7" style={{ color: tpl.color }} />
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1.5 w-12 rounded-full" style={{ background: `${tpl.color}66` }} />
                      <div className="h-1.5 w-8 rounded-full" style={{ background: `${tpl.color}33` }} />
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1 w-20 rounded-full" style={{ background: `${tpl.color}33` }} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{tpl.name}</h3>
                  </div>
                  <p className="text-sm mb-4 flex-1" style={{ color: "var(--text-muted)" }}>{tpl.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(99,139,255,0.1)", color: "var(--text-secondary)", border: "1px solid rgba(99,139,255,0.2)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUseTemplate(tpl.id)}
                    className="w-full py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: `linear-gradient(135deg, ${tpl.color}cc, ${tpl.color})`, color: "#fff" }}
                  >
                    Использовать шаблон
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state hint */}
        <p className="text-center text-sm mt-10" style={{ color: "var(--text-muted)" }}>
          Нет подходящего шаблона?{" "}
          <Link href="/" className="hover:underline" style={{ color: "#638bff" }}>
            Начните с чистого листа
          </Link>
        </p>
      </main>
    </div>
  );
}