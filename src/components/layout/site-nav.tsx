"use client";

import React, { useState } from "react";
import { SquarePen, LogOut, UserCircle, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

interface SiteNavProps {
  /** true — показывать только лого, без меню пользователя (для страниц авторизации) */
  minimal?: boolean;
}

export default function SiteNav({ minimal = false }: SiteNavProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isOnProfile = pathname === "/profile";

  const isAdmin = user?.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/";

  const nav: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.5rem",
    height: "56px",
    background: "rgba(8,12,20,0.92)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(99,139,255,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  };

  return (
    <header style={nav}>
      {/* Лого */}
      <a href={homeHref} style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
        <SquarePen style={{ color: "#638bff", width: 22, height: 22 }} />
        <span style={{ color: "#e8eaf6", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.3px" }}>
          PagesMi
        </span>
        {isAdmin && (
          <span style={{ background: "rgba(99,139,255,0.2)", color: "#638bff", fontSize: "0.65rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "999px", letterSpacing: "0.05em", marginLeft: "0.25rem" }}>
            ADMIN
          </span>
        )}
      </a>

      {/* Меню пользователя — скрыто на minimal страницах */}
      {!minimal && user && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(99,139,255,0.08)", border: "1px solid rgba(99,139,255,0.2)", borderRadius: "0.6rem", padding: "0.4rem 0.75rem", cursor: "pointer" }}
          >
            <UserCircle style={{ color: "#638bff", width: 18, height: 18 }} />
            <span style={{ color: "#e8eaf6", fontSize: "0.85rem" }}>{user.displayName || user.email}</span>
            <ChevronDown style={{ color: "rgba(232,234,246,0.4)", width: 14, height: 14 }} />
          </button>

          {open && (
            <div
              style={{ position: "absolute", right: 0, top: "calc(100% + 0.5rem)", background: "rgba(13,21,38,0.97)", border: "1px solid rgba(99,139,255,0.2)", borderRadius: "0.75rem", minWidth: 190, padding: "0.4rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 100 }}
              onMouseLeave={() => setOpen(false)}
            >
              {/* Инфо */}
              <div style={{ padding: "0.5rem 0.75rem 0.4rem", borderBottom: "1px solid rgba(99,139,255,0.1)", marginBottom: "0.3rem" }}>
                <p style={{ color: "#e8eaf6", fontSize: "0.8rem", fontWeight: 600 }}>{user.displayName || "Пользователь"}</p>
                <p style={{ color: "rgba(232,234,246,0.4)", fontSize: "0.72rem" }}>{user.email}</p>
              </div>

              {/* Ссылка на редактор / админку */}
              <a href={homeHref}
                onClick={() => setOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", textDecoration: "none", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", color: "rgba(232,234,246,0.8)", fontSize: "0.85rem" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,139,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                {isAdmin
                  ? <><Shield style={{ width: 15, height: 15, color: "#638bff" }} /> Панель администратора</>
                  : <><SquarePen style={{ width: 15, height: 15, color: "#638bff" }} /> Перейти в редактор</>
                }
              </a>

              {/* Профиль — только если не admin и не на странице профиля */}
              {!isAdmin && !isOnProfile && (
                <a href="/profile"
                  onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", textDecoration: "none", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", color: "rgba(232,234,246,0.8)", fontSize: "0.85rem" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,139,255,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <UserCircle style={{ width: 15, height: 15, color: "#638bff" }} />
                  Профиль
                </a>
              )}

              <div style={{ borderTop: "1px solid rgba(99,139,255,0.1)", marginTop: "0.3rem", paddingTop: "0.3rem" }}>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", background: "none", border: "none", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", color: "#ef4444", fontSize: "0.85rem", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <LogOut style={{ width: 15, height: 15 }} />
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(99,139,255,0.1)", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
      <p style={{ color: "rgba(232,234,246,0.25)", fontSize: "0.75rem" }}>© 2026 PagesMi. Все права защищены.</p>
      <a href="https://kondrashov-m.ru" target="_blank" rel="noreferrer"
        style={{ color: "rgba(99,139,255,0.5)", fontSize: "0.75rem", textDecoration: "none" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#638bff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(99,139,255,0.5)")}>
        kondrashov-m.ru
      </a>
    </footer>
  );
}
