import type { CanvasElement } from "@/types/canvas-element";
import type { CSSProperties } from "react";

export interface ElementBuilders {
  h1: (text: string, s?: CSSProperties) => CanvasElement;
  h2: (text: string, s?: CSSProperties) => CanvasElement;
  h3: (text: string, s?: CSSProperties) => CanvasElement;
  p: (text: string, s?: CSSProperties) => CanvasElement;
  btn: (text: string, s?: CSSProperties) => CanvasElement;
  box: (children: CanvasElement[], s?: CSSProperties) => CanvasElement;
}

export interface TemplateInfo {
  id: string;
  name: string;
  desc: string;
  colors: [string, string];
}

export const TEMPLATES: TemplateInfo[] = [
  { id: "landing",    name: "Лендинг",        desc: "Hero · Features · Pricing · CTA",  colors: ["#3B82F6", "#6366F1"] },
  { id: "portfolio",  name: "Портфолио",       desc: "Работы · Обо мне · Навыки",        colors: ["#10B981", "#059669"] },
  { id: "business",   name: "Бизнес",          desc: "Услуги · Команда · CTA",           colors: ["#475569", "#1e3a5f"] },
  { id: "saas",       name: "SaaS Продукт",    desc: "Features · Pricing · CTA",         colors: ["#8B5CF6", "#6366F1"] },
  { id: "restaurant", name: "Ресторан / Кафе", desc: "Меню · История · Бронирование",    colors: ["#F59E0B", "#D97706"] },
];

// Liquid Glass palette
const C = {
  bg:      "#080C14",
  card:    "rgba(15,22,48,0.55)",
  cardHov: "rgba(22,33,70,0.7)",
  border:  "rgba(99,139,255,0.18)",
  text:    "#e8eaf6",
  sub:     "rgba(232,234,246,0.6)",
  muted:   "rgba(232,234,246,0.42)",
  accent:  "#638bff",
  accentFg:"#fff",
};

function row(mk: ElementBuilders, items: CanvasElement[]): CanvasElement {
  return mk.box(items, { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "16px", alignItems: "stretch", width: "100%" });
}

function section(mk: ElementBuilders, children: CanvasElement[], bg = "transparent"): CanvasElement {
  return mk.box(children, {
    display: "flex", flexDirection: "column",
    padding: "clamp(40px, 6vw, 80px) clamp(20px, 5vw, 48px)",
    backgroundColor: bg, width: "100%", boxSizing: "border-box",
  });
}

function card(mk: ElementBuilders, children: CanvasElement[], extra?: CSSProperties): CanvasElement {
  return mk.box(children, {
    flex: "1 1 180px", minWidth: "180px", padding: "clamp(16px, 3vw, 28px)",
    display: "flex", flexDirection: "column",
    backgroundColor: C.card, borderRadius: "14px", border: `1px solid ${C.border}`, boxSizing: "border-box", ...extra,
  });
}

function titles(mk: ElementBuilders, h: string, sub: string): CanvasElement[] {
  return [
    mk.h2(h, { textAlign: "center", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: "800", color: C.text, marginBottom: "10px" }),
    mk.p(sub, { textAlign: "center", fontSize: "clamp(13px, 2vw, 16px)", color: C.sub, marginBottom: "clamp(24px, 4vw, 44px)" }),
  ];
}

function ctaBanner(mk: ElementBuilders, title: string, sub: string, btnText: string, gradient: string): CanvasElement {
  return mk.box([
    mk.h2(title, { textAlign: "center", fontSize: "clamp(22px, 4vw, 38px)", fontWeight: "800", color: "#fff", marginBottom: "12px" }),
    mk.p(sub, { textAlign: "center", fontSize: "clamp(13px, 2vw, 16px)", color: "rgba(255,255,255,0.75)", marginBottom: "28px" }),
    mk.btn(btnText, { backgroundColor: "#fff", color: "#6366F1", padding: "13px 36px", fontSize: "15px", fontWeight: "700", borderRadius: "10px" }),
  ], {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 48px)",
    background: gradient, borderRadius: "20px",
    margin: "clamp(16px, 3vw, 40px) clamp(16px, 3vw, 40px) 0",
    width: "calc(100% - clamp(32px, 6vw, 80px))", boxSizing: "border-box",
  });
}

/* ─── LANDING ─── */
function buildLanding(mk: ElementBuilders): CanvasElement[] {
  const hero = mk.box([
    mk.p("КОНСТРУКТОР САЙТОВ", { textAlign: "center", fontSize: "11px", fontWeight: "600", letterSpacing: "0.15em", color: C.accent, marginBottom: "16px" }),
    mk.h1("Создайте свой сайт без кода", { textAlign: "center", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: "800", color: C.text, lineHeight: "1.2", marginBottom: "18px" }),
    mk.p("Простой визуальный конструктор для создания профессиональных сайтов без программирования.", { textAlign: "center", fontSize: "clamp(14px, 2vw, 17px)", color: C.sub, lineHeight: "1.7", marginBottom: "32px" }),
    mk.box([
      mk.btn("Начать бесплатно", { background: "linear-gradient(135deg,#3b7fff,#638bff)", color: "#fff", padding: "12px 24px", fontSize: "14px", borderRadius: "10px", fontWeight: "600", border: "none" }),
      mk.btn("Смотреть демо →", { backgroundColor: "transparent", color: C.text, padding: "12px 24px", fontSize: "14px", border: `1px solid ${C.border}`, borderRadius: "10px" }),
    ], { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "12px", justifyContent: "center" }),
  ], { display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(48px,8vw,100px) clamp(20px,5vw,60px) clamp(40px,6vw,80px)", width: "100%", boxSizing: "border-box", background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,139,255,0.13) 0%, transparent 70%)" });

  const stats = section(mk, [
    ...titles(mk, "Нам доверяют", "Цифры говорят сами за себя"),
    row(mk, [["10 000+", "Активных пользователей"], ["500+", "Сайтов создано"], ["99.9%", "Uptime гарантия"]].map(([n, l]) =>
      card(mk, [
        mk.h2(n, { textAlign: "center", fontSize: "36px", fontWeight: "800", color: C.accent, marginBottom: "6px" }),
        mk.p(l, { textAlign: "center", fontSize: "14px", color: C.muted }),
      ], { alignItems: "center" })
    )),
  ], C.card);

  const features = section(mk, [
    ...titles(mk, "Всё что нужно для сайта", "Мощные инструменты в простом интерфейсе"),
    row(mk, [
      ["Визуальный редактор", "Перетащите элементы на холст и настройте внешний вид без кода.", "#6366F1"],
      ["Готовые шаблоны", "Десятки профессиональных шаблонов для быстрого старта.", "#3B82F6"],
      ["Публикация 1 клик", "Опубликуйте сайт одним нажатием — хостинг и SSL включены.", "#10B981"],
    ].map(([t, d, c]) => card(mk, [
      mk.box([], { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: c as string, marginBottom: "16px", minHeight: "44px", flexShrink: "0" as unknown as number }),
      mk.h3(t as string, { fontSize: "17px", fontWeight: "700", color: C.text, marginBottom: "10px" }),
      mk.p(d as string, { fontSize: "14px", color: C.sub, lineHeight: "1.6" }),
    ]))),
  ]);

  const pricing = section(mk, [
    ...titles(mk, "Прозрачные тарифы", "Начните бесплатно — растите вместе с нами"),
    row(mk, [
      { n: "Старт", p: "Бесплатно", d: "Для личных проектов", hl: false },
      { n: "Про", p: "990 ₽/мес", d: "Для малого бизнеса", hl: true },
      { n: "Бизнес", p: "2990 ₽/мес", d: "Без ограничений", hl: false },
    ].map(item => mk.box([
      mk.h3(item.n, { textAlign: "center", fontSize: "16px", fontWeight: "600", color: item.hl ? "#fff" : C.text, marginBottom: "8px" }),
      mk.h2(item.p, { textAlign: "center", fontSize: "30px", fontWeight: "800", color: item.hl ? "#fff" : C.text, marginBottom: "8px" }),
      mk.p(item.d, { textAlign: "center", fontSize: "13px", color: item.hl ? "rgba(255,255,255,0.7)" : C.muted, marginBottom: "24px" }),
      mk.btn("Начать", { width: "100%", background: item.hl ? "#fff" : "linear-gradient(135deg,#3b7fff,#638bff)", color: item.hl ? "#6366F1" : "#fff", padding: "10px", fontSize: "14px", fontWeight: "600", borderRadius: "8px", border: "none" }),
    ], { flex: "1", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: item.hl ? "#5a5fcf" : C.card, borderRadius: "16px", border: item.hl ? "1px solid rgba(99,139,255,0.5)" : `1px solid ${C.border}`, minHeight: "220px" }))),
  ], C.card);

  return [hero, stats, features, pricing, ctaBanner(mk, "Готовы создать свой сайт?", "Присоединяйтесь к тысячам пользователей прямо сейчас.", "Создать сайт бесплатно", "linear-gradient(135deg, #4f46e5, #7c3aed, #be185d)")];
}

/* ─── PORTFOLIO ─── */
function buildPortfolio(mk: ElementBuilders): CanvasElement[] {
  const hero = mk.box([
    mk.p("Дизайнер · Разработчик · Творец", { textAlign: "center", fontSize: "13px", letterSpacing: "0.1em", color: C.accent, marginBottom: "16px", fontWeight: "500" }),
    mk.h1("Привет, я Алексей", { textAlign: "center", fontSize: "clamp(28px,5vw,56px)", fontWeight: "800", color: C.text, lineHeight: "1.15", marginBottom: "20px" }),
    mk.p("Создаю красивые и функциональные цифровые продукты. 10 лет опыта.", { textAlign: "center", fontSize: "clamp(14px,2vw,18px)", color: C.sub, lineHeight: "1.7", marginBottom: "36px" }),
    mk.box([
      mk.btn("Мои работы", { background: "linear-gradient(135deg,#3b7fff,#638bff)", color: "#fff", padding: "12px 24px", fontSize: "14px", borderRadius: "10px", border: "none" }),
      mk.btn("Связаться", { backgroundColor: "transparent", color: C.text, padding: "12px 24px", fontSize: "14px", border: `1px solid ${C.border}`, borderRadius: "10px" }),
    ], { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }),
  ], { display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(48px,8vw,120px) clamp(20px,5vw,60px) clamp(40px,6vw,80px)", boxSizing: "border-box", background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,139,255,0.1) 0%, transparent 70%)" });

  const works = section(mk, [
    ...titles(mk, "Последние работы", "Избранные проекты из портфолио"),
    row(mk, [
      { t: "E-commerce платформа", tag: "Веб-разработка", bg: "#3B82F6" },
      { t: "Мобильное приложение", tag: "UI/UX Дизайн", bg: "#8B5CF6" },
      { t: "Корпоративный портал", tag: "Full-stack", bg: "#10B981" },
    ].map(w => mk.box([
      mk.box([], { height: "140px", background: `linear-gradient(135deg, ${w.bg}, ${w.bg}99)`, borderRadius: "8px 8px 0 0", minHeight: "140px" }),
      mk.box([
        mk.p(w.tag, { fontSize: "11px", fontWeight: "600", color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }),
        mk.h3(w.t, { fontSize: "16px", fontWeight: "700", color: C.text }),
      ], { padding: "16px", display: "flex", flexDirection: "column" }),
    ], { flex: "1", display: "flex", flexDirection: "column", backgroundColor: C.card, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "hidden" }))),
  ]);

  const about = mk.box([
    mk.box([
      mk.p("ОБО МНЕ", { fontSize: "11px", fontWeight: "600", color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }),
      mk.h2("Страсть к красивому коду", { fontSize: "32px", fontWeight: "800", color: C.text, marginBottom: "20px", lineHeight: "1.3" }),
      mk.p("Я создаю цифровые продукты, которые решают реальные задачи бизнеса. React, Next.js, TypeScript, Figma.", { fontSize: "15px", color: C.sub, lineHeight: "1.8" }),
    ], { flex: "1", display: "flex", flexDirection: "column", justifyContent: "center" }),
    mk.box([], { flex: "1", minHeight: "300px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", borderRadius: "16px" }),
  ], { display: "flex", flexDirection: "row", gap: "60px", padding: "80px 48px", alignItems: "center", backgroundColor: C.card, width: "100%" });

  const skills = section(mk, [
    ...titles(mk, "Навыки", "Технологии и инструменты"),
    mk.box(
      ["React / Next.js", "TypeScript", "UI/UX Design", "Node.js", "Figma", "CSS / Tailwind"].map(s =>
        mk.box([mk.p(s, { fontSize: "13px", fontWeight: "600", color: C.text, textAlign: "center" })],
          { padding: "10px 20px", backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: "100px" })
      ),
      { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px", justifyContent: "center" }
    ),
  ]);

  return [hero, works, about, skills, ctaBanner(mk, "Давайте работать вместе", "Есть интересный проект? Напишите мне — обсудим детали.", "Написать письмо", "linear-gradient(135deg, #4f46e5, #7c3aed)")];
}

/* ─── BUSINESS ─── */
function buildBusiness(mk: ElementBuilders): CanvasElement[] {
  const hero = mk.box([
    mk.h1("Надёжный партнёр для вашего бизнеса", { textAlign: "center", fontSize: "clamp(24px,5vw,48px)", fontWeight: "800", color: C.text, lineHeight: "1.2", marginBottom: "20px" }),
    mk.p("Профессиональные услуги для роста вашей компании. Опыт, качество, результат.", { textAlign: "center", fontSize: "clamp(14px,2vw,17px)", color: C.sub, lineHeight: "1.7", marginBottom: "36px" }),
    mk.box([
      mk.btn("Получить консультацию", { background: "linear-gradient(135deg,#3b7fff,#638bff)", color: "#fff", padding: "12px 24px", fontSize: "14px", borderRadius: "10px", border: "none" }),
      mk.btn("Наши услуги", { backgroundColor: "transparent", color: C.text, padding: "12px 24px", fontSize: "14px", border: `1px solid ${C.border}`, borderRadius: "10px" }),
    ], { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }),
  ], { display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(48px,8vw,100px) clamp(20px,5vw,60px) clamp(40px,6vw,80px)", boxSizing: "border-box", background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.1) 0%, transparent 70%)" });

  const svcData: [string, string, string][] = [
    ["💼", "Стратегический консалтинг", "Разрабатываем стратегию роста на основе данных и опыта."],
    ["📊", "Финансовый анализ", "Анализируем показатели и находим точки роста эффективности."],
    ["🚀", "Digital-маркетинг", "Привлекаем клиентов через эффективные digital-каналы."],
    ["⚙️", "IT-решения", "Внедряем технологии для автоматизации бизнес-процессов."],
    ["🤝", "HR-консалтинг", "Помогаем строить сильные команды и культуру."],
    ["📱", "Веб-разработка", "Создаём современные сайты и приложения для бизнеса."],
  ];
  const svcCard = ([icon, t, d]: [string, string, string]) => card(mk, [
    mk.p(icon, { fontSize: "30px", marginBottom: "16px" }),
    mk.h3(t, { fontSize: "16px", fontWeight: "700", color: C.text, marginBottom: "10px" }),
    mk.p(d, { fontSize: "14px", color: C.sub, lineHeight: "1.6" }),
  ]);
  const services = section(mk, [
    ...titles(mk, "Наши услуги", "Комплексный подход к развитию бизнеса"),
    row(mk, svcData.slice(0, 3).map(svcCard)),
    mk.box([], { height: "20px" }),
    row(mk, svcData.slice(3).map(svcCard)),
  ]);

  const teamData: [string, string, string, string][] = [
    ["Сергей Петров", "CEO & Основатель", "15 лет опыта", "#3B82F6"],
    ["Анна Козлова", "Директор по развитию", "12 лет опыта", "#8B5CF6"],
    ["Михаил Волков", "Технический директор", "10 лет опыта", "#10B981"],
  ];
  const team = section(mk, [
    ...titles(mk, "Наша команда", "Профессионалы с многолетним опытом"),
    row(mk, teamData.map(([name, role, exp, color]) => card(mk, [
      mk.box([], { width: "80px", height: "80px", borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}99)`, margin: "0 auto 16px", minHeight: "80px", flexShrink: "0" as unknown as number }),
      mk.h3(name, { textAlign: "center", fontSize: "16px", fontWeight: "700", color: C.text, marginBottom: "4px" }),
      mk.p(role, { textAlign: "center", fontSize: "13px", color: C.accent, fontWeight: "500", marginBottom: "4px" }),
      mk.p(exp, { textAlign: "center", fontSize: "12px", color: C.muted }),
    ], { alignItems: "center" }))),
  ], C.card);

  return [hero, services, team, ctaBanner(mk, "Начнём сотрудничество?", "Свяжитесь с нами и получите бесплатную консультацию.", "Связаться с нами", "linear-gradient(135deg, #1e3a5f, #2563EB)")];
}

/* ─── SAAS ─── */
function buildSaaS(mk: ElementBuilders): CanvasElement[] {
  const hero = mk.box([
    mk.box([mk.p("🚀 Новая версия 2.0 уже доступна", { fontSize: "12px", fontWeight: "600", color: C.accent, textAlign: "center" })],
      { display: "inline-flex", padding: "6px 16px", borderRadius: "100px", border: `1px solid ${C.border}`, marginBottom: "24px", alignSelf: "center" }),
    mk.h1("Автоматизируйте работу с помощью AI", { textAlign: "center", fontSize: "clamp(26px,5vw,54px)", fontWeight: "900", color: C.text, lineHeight: "1.15", marginBottom: "20px" }),
    mk.p("Платформа нового поколения для управления задачами, командой и проектами с AI.", { textAlign: "center", fontSize: "clamp(14px,2vw,18px)", color: C.sub, lineHeight: "1.7", marginBottom: "36px" }),
    mk.box([
      mk.btn("Попробовать бесплатно", { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", padding: "12px 24px", fontSize: "14px", borderRadius: "10px", fontWeight: "600", border: "none" }),
      mk.btn("Смотреть презентацию", { backgroundColor: "transparent", color: C.text, padding: "12px 24px", fontSize: "14px", border: `1px solid ${C.border}`, borderRadius: "10px" }),
    ], { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }),
    mk.p("Бесплатно 14 дней · Без карты · Отмена в любой момент", { textAlign: "center", fontSize: "12px", color: C.muted, marginTop: "16px" }),
  ], { display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(48px,8vw,100px) clamp(20px,5vw,60px) clamp(40px,6vw,80px)", boxSizing: "border-box", background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.13) 0%, transparent 70%)" });

  const feat6: [string, string, string][] = [
    ["AI-помощник", "Умный ассистент расставляет приоритеты и предлагает следующие шаги.", "#6366F1"],
    ["Совместная работа", "Работайте с командой в реальном времени с комментариями и упоминаниями.", "#3B82F6"],
    ["Аналитика", "Визуальные дашборды и детальная аналитика по всем метрикам команды.", "#10B981"],
    ["Интеграции", "Slack, GitHub, Jira, Google Workspace и 200+ других инструментов.", "#F59E0B"],
    ["Безопасность", "Enterprise-grade шифрование, SSO и двухфакторная аутентификация.", "#EF4444"],
    ["API & Webhooks", "Стройте собственные интеграции с мощным REST API.", "#8B5CF6"],
  ];
  const featCard = ([t, d, c]: [string, string, string]) => card(mk, [
    mk.box([], { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: c, marginBottom: "16px", minHeight: "40px", flexShrink: "0" as unknown as number }),
    mk.h3(t, { fontSize: "16px", fontWeight: "700", color: C.text, marginBottom: "8px" }),
    mk.p(d, { fontSize: "14px", color: C.sub, lineHeight: "1.6" }),
  ]);
  const features = section(mk, [
    ...titles(mk, "Возможности платформы", "Всё необходимое в одном месте"),
    row(mk, feat6.slice(0, 3).map(featCard)),
    mk.box([], { height: "16px" }),
    row(mk, feat6.slice(3).map(featCard)),
  ]);

  const pricing = section(mk, [
    ...titles(mk, "Простые цены", "Начните бесплатно"),
    row(mk, [
      { n: "Стартер", p: "Бесплатно", d: "До 5 пользователей", hl: false },
      { n: "Команда", p: "990 ₽/мес", d: "До 50 пользователей", hl: true },
      { n: "Компания", p: "По запросу", d: "Без ограничений", hl: false },
    ].map(item => mk.box([
      mk.h3(item.n, { textAlign: "center", fontSize: "16px", fontWeight: "600", color: item.hl ? "#fff" : C.text, marginBottom: "8px" }),
      mk.h2(item.p, { textAlign: "center", fontSize: "28px", fontWeight: "800", color: item.hl ? "#fff" : C.text, marginBottom: "8px" }),
      mk.p(item.d, { textAlign: "center", fontSize: "13px", color: item.hl ? "rgba(255,255,255,0.7)" : C.muted, marginBottom: "24px" }),
      mk.btn("Выбрать план", { width: "100%", background: item.hl ? "#fff" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: item.hl ? "#6366F1" : "#fff", padding: "10px", fontSize: "14px", fontWeight: "600", borderRadius: "8px", border: "none" }),
    ], { flex: "1", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: item.hl ? "#4f46e5" : C.card, borderRadius: "16px", border: item.hl ? "1px solid rgba(99,102,241,0.5)" : `1px solid ${C.border}`, minHeight: "220px" }))),
  ], C.card);

  return [hero, features, pricing, ctaBanner(mk, "Готовы начать?", "Зарегистрируйтесь и начните бесплатный пробный период на 14 дней.", "Начать бесплатно →", "linear-gradient(135deg, #4f46e5, #7c3aed, #be185d)")];
}

/* ─── RESTAURANT ─── */
function buildRestaurant(mk: ElementBuilders): CanvasElement[] {
  const hero = mk.box([
    mk.p("С 1998 года", { textAlign: "center", fontSize: "13px", letterSpacing: "0.12em", fontWeight: "500", color: "#F59E0B", marginBottom: "16px", textTransform: "uppercase" }),
    mk.h1("Итальянская кухня с душой", { textAlign: "center", fontSize: "clamp(26px,5vw,52px)", fontWeight: "800", color: C.text, lineHeight: "1.2", marginBottom: "20px" }),
    mk.p("Аутентичные рецепты, свежие ингредиенты и атмосфера Тосканы в сердце города.", { textAlign: "center", fontSize: "clamp(14px,2vw,17px)", color: C.sub, lineHeight: "1.7", marginBottom: "36px" }),
    mk.box([
      mk.btn("Забронировать столик", { background: "linear-gradient(135deg,#D97706,#F59E0B)", color: "#fff", padding: "12px 24px", fontSize: "14px", borderRadius: "10px", border: "none" }),
      mk.btn("Смотреть меню", { backgroundColor: "transparent", color: C.text, padding: "12px 24px", fontSize: "14px", border: `1px solid ${C.border}`, borderRadius: "10px" }),
    ], { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }),
  ], { display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(48px,8vw,100px) clamp(20px,5vw,60px) clamp(40px,6vw,80px)", boxSizing: "border-box", background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 70%)" });

  const menuItems: [string, string, string, string][] = [
    ["Тальятелле с трюфелем", "890 ₽", "Паста", "#F59E0B"],
    ["Тирамису классический", "450 ₽", "Десерт", "#92400E"],
    ["Пицца Маргарита", "690 ₽", "Пицца", "#EF4444"],
    ["Ризотто с морепродуктами", "1200 ₽", "Основное", "#3B82F6"],
    ["Брускетта ассорти", "380 ₽", "Закуска", "#10B981"],
    ["Pannacotta ванильная", "390 ₽", "Десерт", "#8B5CF6"],
  ];
  const menuCard = ([name, price, tag, bg]: [string, string, string, string]) => mk.box([
    mk.box([], { height: "100px", background: `linear-gradient(135deg, ${bg}, ${bg}99)`, borderRadius: "8px 8px 0 0", minHeight: "100px" }),
    mk.box([
      mk.p(tag, { fontSize: "10px", fontWeight: "600", color: "#F59E0B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }),
      mk.h3(name, { fontSize: "15px", fontWeight: "700", color: C.text, marginBottom: "8px" }),
      mk.p(price, { fontSize: "18px", fontWeight: "800", color: C.text }),
    ], { padding: "14px", display: "flex", flexDirection: "column" }),
  ], { flex: "1", display: "flex", flexDirection: "column", backgroundColor: C.card, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "hidden" });

  const menuSection = section(mk, [
    ...titles(mk, "Наше меню", "Свежие ингредиенты, классические рецепты"),
    row(mk, menuItems.slice(0, 3).map(menuCard)),
    mk.box([], { height: "20px" }),
    row(mk, menuItems.slice(3).map(menuCard)),
  ]);

  const about = mk.box([
    mk.box([], { flex: "1", minHeight: "300px", background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: "16px" }),
    mk.box([
      mk.p("НАША ИСТОРИЯ", { fontSize: "11px", fontWeight: "600", color: "#F59E0B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }),
      mk.h2("Семейный ресторан с 1998 года", { fontSize: "32px", fontWeight: "800", color: C.text, marginBottom: "20px", lineHeight: "1.3" }),
      mk.p("Наш ресторан открыл Джузеппе Марини — повар из Флоренции. Мы сохраняем семейные рецепты и атмосферу настоящей Италии.", { fontSize: "15px", color: C.sub, lineHeight: "1.8", marginBottom: "24px" }),
      mk.btn("О нас подробнее", { background: "linear-gradient(135deg,#D97706,#F59E0B)", color: "#fff", padding: "12px 28px", fontSize: "14px", borderRadius: "8px", width: "auto", border: "none" }),
    ], { flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "40px" }),
  ], { display: "flex", flexDirection: "row", gap: "40px", padding: "80px 48px", alignItems: "center", backgroundColor: C.card, width: "100%" });

  return [hero, menuSection, about, ctaBanner(mk, "Забронируйте столик", "Ждём вас каждый день с 12:00 до 23:00. Бронирование онлайн или по телефону.", "Забронировать сейчас", "linear-gradient(135deg, #92400E, #D97706)")];
}

export function buildTemplateBody(templateId: string, mk: ElementBuilders): CanvasElement[] {
  switch (templateId) {
    case "landing":    return buildLanding(mk);
    case "portfolio":  return buildPortfolio(mk);
    case "business":   return buildBusiness(mk);
    case "saas":       return buildSaaS(mk);
    case "restaurant": return buildRestaurant(mk);
    default:           return [];
  }
}
