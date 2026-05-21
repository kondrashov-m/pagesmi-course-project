"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import SiteNav, { SiteFooter } from "@/components/layout/site-nav";
import {
  FolderOpen, Plus, Trash2, Edit, Loader2,
  FileText, Calendar, LayoutDashboard,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  data: any;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login?from=/dashboard");
  }, [user, authLoading, router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const data = await res.json();
      setProjects(data.projects ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const handleOpen = (project: Project) => {
    if (user?.role === "admin") { router.push("/admin"); return; }
    if (typeof window !== "undefined") {
      localStorage.setItem("activeProjectId_" + user!.id, project.id);
    }
    router.push("/");
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const firstPageId = crypto.randomUUID();
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Новый проект",
          data: {
            pages: [{
              id: firstPageId,
              name: "Главная",
              path: "/",
              elements: [],
              canvasStyles: {},
              gridSettings: { showGrid: false, gridSize: "20" },
            }],
            siteName: "Новый проект",
            activePageId: firstPageId,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Проект создан" });
      if (user?.role === "admin") { router.push("/admin"); return; }
      if (typeof window !== "undefined") {
        localStorage.setItem("activeProjectId_" + user!.id, data.project.id);
      }
      router.push("/");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить проект «${name}»? Это действие нельзя отменить.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
      toast({ title: "Проект удалён", description: name });
      setProjects(prev => prev.filter(p => p.id !== id));
      // Если удалили активный — сбрасываем
      if (typeof window !== "undefined") {
        const active = localStorage.getItem("activeProjectId_" + user!.id);
        if (active === id) localStorage.removeItem("activeProjectId_" + user!.id);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    try {
      const project = projects.find(p => p.id === id)!;
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: renameValue.trim(), data: project.data }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: renameValue.trim() } : p));
      toast({ title: "Переименовано" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setRenamingId(null);
      setRenameValue("");
    }
  };

  const glass: React.CSSProperties = {
    background: "rgba(15,22,48,0.7)",
    border: "1px solid rgba(99,139,255,0.18)",
    backdropFilter: "blur(20px)",
    borderRadius: "1rem",
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#080C14" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#638bff" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "linear-gradient(135deg,#080C14 0%,#0d1526 100%)" }}>
      <SiteNav />

      <main className="flex-1 p-6 md:p-10" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6" style={{ color: "#638bff" }} />
            <div>
              <h1 style={{ color: "#e8eaf6", fontSize: "1.5rem", fontWeight: 700 }}>Мои проекты</h1>
              <p style={{ color: "rgba(232,234,246,0.4)", fontSize: "0.8rem" }}>
                {user.displayName || user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg,#3b7fff,#638bff)", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", opacity: creating ? 0.7 : 1 }}
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Новый проект
          </button>
        </div>

        {/* Список проектов */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#638bff" }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ ...glass, padding: "3rem" }}>
            <FolderOpen className="h-14 w-14" style={{ color: "rgba(99,139,255,0.4)" }} />
            <p style={{ color: "rgba(232,234,246,0.6)", fontSize: "1.1rem" }}>Проектов пока нет</p>
            <p style={{ color: "rgba(232,234,246,0.3)", fontSize: "0.875rem" }}>Нажмите «Новый проект» чтобы начать</p>
          </div>
        ) : (
          <div style={{ ...glass, overflow: "hidden" }}>
            {/* Заголовок таблицы */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 130px", gap: "0.5rem", padding: "0.6rem 1.25rem", borderBottom: "1px solid rgba(99,139,255,0.12)" }}>
              {["Название", "Страниц", "Обновлён", ""].map((h, i) => (
                <span key={i} style={{ color: "rgba(232,234,246,0.35)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 3 ? "right" : "left" }}>{h}</span>
              ))}
            </div>

            {/* Строки */}
            {projects.map((project, idx) => {
              const pageCount = project.data?.pages?.length ?? 0;
              const updated = new Date(project.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
              const isDeleting = deletingId === project.id;
              const isRenaming = renamingId === project.id;
              const isLast = idx === projects.length - 1;

              return (
                <div key={project.id}
                  style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 130px", gap: "0.5rem", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: isLast ? "none" : "1px solid rgba(99,139,255,0.07)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,139,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Название */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "rgba(99,139,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText style={{ width: 15, height: 15, color: "#638bff" }} />
                    </div>
                    {isRenaming ? (
                      <input autoFocus value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleRename(project.id); if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); } }}
                        onBlur={() => handleRename(project.id)}
                        style={{ background: "rgba(15,22,48,0.8)", border: "1px solid rgba(99,139,255,0.4)", borderRadius: "0.4rem", padding: "0.2rem 0.5rem", color: "#e8eaf6", fontSize: "0.875rem", outline: "none", width: "100%" }}
                      />
                    ) : (
                      <span style={{ color: "#e8eaf6", fontWeight: 600, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project.name}
                      </span>
                    )}
                  </div>

                  {/* Страниц */}
                  <span style={{ color: "rgba(232,234,246,0.45)", fontSize: "0.8rem" }}>
                    {pageCount} стр.
                  </span>

                  {/* Дата */}
                  <span style={{ color: "rgba(232,234,246,0.35)", fontSize: "0.78rem" }}>
                    {updated}
                  </span>

                  {/* Кнопки */}
                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpen(project)}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "linear-gradient(135deg,#3b7fff,#638bff)", border: "none", borderRadius: "0.5rem", padding: "0.4rem 0.85rem", color: "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                      <Edit style={{ width: 12, height: 12 }} /> Открыть
                    </button>
                    <button onClick={() => { setRenamingId(project.id); setRenameValue(project.name); }} title="Переименовать"
                      style={{ background: "rgba(99,139,255,0.1)", border: "1px solid rgba(99,139,255,0.2)", borderRadius: "0.5rem", padding: "0.4rem 0.5rem", cursor: "pointer" }}>
                      <Edit style={{ width: 13, height: 13, color: "#638bff" }} />
                    </button>
                    <button onClick={() => handleDelete(project.id, project.name)} disabled={isDeleting} title="Удалить"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.5rem", padding: "0.4rem 0.5rem", cursor: "pointer" }}>
                      {isDeleting
                        ? <Loader2 style={{ width: 13, height: 13, color: "#ef4444" }} className="animate-spin" />
                        : <Trash2 style={{ width: 13, height: 13, color: "#ef4444" }} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
