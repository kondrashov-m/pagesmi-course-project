"use client";

import { SquarePen, LogOut, UserCircle, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useState } from "react";

export default function AdminNav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.5rem",
    height: "56px",
    background: "rgba(8,12,20,0.92)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(99,139,255,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  };

  return (
    <header style={nav}>
      {/* Лого */}
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
        <SquarePen style={{ color: "#638bff", width: 22, height: 22 }} />
        <span style={{ color: "#e8eaf6", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.3px" }}>
          PagesMi
        </span>
        <span style={{ background: "rgba(99,139,255,0.2)", color: "#638bff", fontSize: "0.65rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "999px", letterSpacing: "0.05em", marginLeft: "0.25rem" }}>
          ADMIN
        </span>
      </Link>

      {/* Профиль */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(99,139,255,0.08)", border: "1px solid rgba(99,139,255,0.2)", borderRadius: "0.6rem", padding: "0.4rem 0.75rem", cursor: "pointer" }}
        >
          <UserCircle style={{ color: "#638bff", width: 18, height: 18 }} />
          <span style={{ color: "#e8eaf6", fontSize: "0.85rem" }}>{user?.displayName || user?.email}</span>
          <ChevronDown style={{ color: "rgba(232,234,246,0.4)", width: 14, height: 14 }} />
        </button>

        {open && (
          <div
            style={{ position: "absolute", right: 0, top: "calc(100% + 0.5rem)", background: "rgba(13,21,38,0.97)", border: "1px solid rgba(99,139,255,0.2)", borderRadius: "0.75rem", minWidth: 180, padding: "0.4rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 100 }}
            onMouseLeave={() => setOpen(false)}
          >
            <div style={{ padding: "0.5rem 0.75rem 0.4rem", borderBottom: "1px solid rgba(99,139,255,0.1)", marginBottom: "0.3rem" }}>
              <p style={{ color: "#e8eaf6", fontSize: "0.8rem", fontWeight: 600 }}>{user?.displayName || "Admin"}</p>
              <p style={{ color: "rgba(232,234,246,0.4)", fontSize: "0.72rem" }}>{user?.email}</p>
            </div>
            <button
              onClick={() => { setOpen(false); logout(); }}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", background: "none", border: "none", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", color: "#ef4444", fontSize: "0.85rem", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <LogOut style={{ width: 15, height: 15 }} />
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
