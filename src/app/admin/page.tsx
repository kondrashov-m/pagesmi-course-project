"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Shield, Users, Loader2, Database, FolderOpen, ExternalLink,
  RefreshCw, Eye, X, FileText, Layout, Type, Image as ImageIcon,
  Square, Minus, AlignLeft, Code, Monitor, Radio,
  Edit2, Check, KeyRound, ChevronDown, ChevronUp, Trash2,
} from "lucide-react";
import SiteNav, { SiteFooter } from "@/components/layout/site-nav";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserRow { id: string; email: string; displayName: string | null; role: string; createdAt: string }
interface SitePage { id: string; name: string; path: string; elements: any[]; canvasStyles?: Record<string, any> }
interface ProjectRow { id: string; name: string; userId: string; updatedAt: string; createdAt: string; userEmail?: string; data?: { pages?: SitePage[]; siteName?: string; activePageId?: string } }
interface Stats { users: number; projects: number; online: number; templates: number }

// ─── HTML preview helpers ─────────────────────────────────────────────────────
function camelToKebab(s: string) { return s.replace(/([A-Z])/g, m => "-" + m.toLowerCase()); }
function styleObj(styles?: Record<string, any>) {
  if (!styles) return "";
  return Object.entries(styles).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${camelToKebab(k)}:${v}`).join(";");
}
function elToHtml(el: any): string {
  const s = styleObj(el.styles);
  const kids = (el.children ?? []).map(elToHtml).join("");
  if (el.type === "Image") return `<img src="${el.src ?? ""}" alt="${el.alt ?? ""}" style="${s}"/>`;
  if (el.type === "Divider") return `<hr style="${s}"/>`;
  return `<div style="${s}">${el.content ?? ""}${kids}</div>`;
}
function buildPreviewHtml(page: SitePage) {
  const cs = styleObj({ minHeight: "100vh", position: "relative", ...(page.canvasStyles ?? {}) });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;background:#080C14;color:#e8eaf6}img{max-width:100%}a{color:inherit;text-decoration:none}</style>
</head><body><div style="${cs}">${(page.elements ?? []).map(elToHtml).join("")}</div></body></html>`;
}

// ─── Element tree ─────────────────────────────────────────────────────────────
const EL_ICONS: Record<string, React.ReactNode> = {
  Header: <Layout style={{ width: 12, height: 12, color: "#638bff" }} />,
  Footer: <Layout style={{ width: 12, height: 12, color: "#8b5cf6" }} />,
  Heading1: <Type style={{ width: 12, height: 12, color: "#10b981" }} />,
  Heading2: <Type style={{ width: 12, height: 12, color: "#10b981" }} />,
  Paragraph: <AlignLeft style={{ width: 12, height: 12, color: "#f59e0b" }} />,
  Button: <Square style={{ width: 12, height: 12, color: "#3b7fff" }} />,
  Image: <ImageIcon style={{ width: 12, height: 12, color: "#ec4899" }} />,
  Divider: <Minus style={{ width: 12, height: 12, color: "rgba(232,234,246,0.4)" }} />,
  Container: <Code style={{ width: 12, height: 12, color: "#f59e0b" }} />,
};
function countEls(els: any[]): number { return els.reduce((a, e) => a + 1 + (e.children?.length ? countEls(e.children) : 0), 0); }
function ElRow({ el, depth }: { el: any; depth: number }) {
  const [open, setOpen] = useState(true);
  const hasKids = el.children?.length > 0;
  const icon = EL_ICONS[el.type] ?? <FileText style={{ width: 12, height: 12, color: "rgba(232,234,246,0.4)" }} />;
  const preview = el.content ? el.content.replace(/<[^>]+>/g, "").trim().slice(0, 55) : el.src?.slice(0, 40) ?? "";
  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div onClick={() => hasKids && setOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.5rem", borderRadius: "0.4rem", background: "rgba(99,139,255,0.04)", border: "1px solid rgba(99,139,255,0.1)", cursor: hasKids ? "pointer" : "default", marginBottom: "0.2rem" }}>
        <span style={{ flexShrink: 0 }}>{icon}</span>
        <span style={{ color: "rgba(232,234,246,0.7)", fontSize: "0.72rem", fontWeight: 500, minWidth: 72 }}>{el.type}</span>
        {preview && <span style={{ color: "rgba(232,234,246,0.35)", fontSize: "0.67rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{preview}</span>}
        {hasKids && <span style={{ color: "rgba(99,139,255,0.5)", fontSize: "0.65rem", flexShrink: 0 }}>{open ? "▾" : "▸"} {el.children.length}</span>}
      </div>
      {hasKids && open && el.children.map((c: any, i: number) => <ElRow key={c.id ?? i} el={c} depth={depth + 1} />)}
    </div>
  );
}

// ─── Inline style helpers ─────────────────────────────────────────────────────
const glass: React.CSSProperties = { background: "rgba(15,22,48,0.7)", border: "1px solid rgba(99,139,255,0.18)", backdropFilter: "blur(20px)", borderRadius: "1rem" };
const inp: React.CSSProperties = { background: "rgba(15,22,48,0.6)", border: "1px solid rgba(99,139,255,0.25)", color: "#e8eaf6", borderRadius: "0.5rem", padding: "0.45rem 0.7rem", fontSize: "0.82rem", outline: "none", width: "100%" };
const btnSm = (color: string): React.CSSProperties => ({ background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.3)`, borderRadius: "0.4rem", padding: "0.3rem 0.6rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: `rgb(${color})`, whiteSpace: "nowrap" });

// ═════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users,     setUsers]     = useState<UserRow[]>([]);
  const [projects,  setProjects]  = useState<ProjectRow[]>([]);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [fetching,  setFetching]  = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "projects">("users");

  // Project viewer
  const [viewProject, setViewProject] = useState<ProjectRow | null>(null);
  const [viewPageId,  setViewPageId]  = useState<string | null>(null);
  const [viewMode,    setViewMode]    = useState<"preview" | "elements">("preview");

  // Edit user state — id → field values
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editEmail,   setEditEmail]   = useState("");
  const [editName,    setEditName]    = useState("");
  const [editPass,    setEditPass]    = useState("");
  const [editRole,    setEditRole]    = useState("user");
  const [saving,      setSaving]      = useState(false);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string; name: string | null; isSelf: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (!loading && user && user.role !== "admin") router.replace("/"); }, [user, loading, router]);

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [ur, sr, pr] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/stats"), fetch("/api/admin/projects")]);
      if (ur.ok) setUsers(await ur.json());
      if (sr.ok) setStats(await sr.json());
      if (pr.ok) setProjects(await pr.json());
    } finally { setFetching(false); }
  };

  useEffect(() => {
    if (user?.role !== "admin") return;
    fetchAll();
    const id = setInterval(fetchAll, 30_000);
    return () => clearInterval(id);
  }, [user]);

  const startEdit = (u: UserRow) => {
    setEditingId(u.id); setEditEmail(u.email);
    setEditName(u.displayName ?? ""); setEditPass(""); setEditRole(u.role);
  };
  const cancelEdit = () => { setEditingId(null); setEditPass(""); };

  const saveEdit = async (u: UserRow) => {
    setSaving(true);
    try {
      const body: Record<string, string> = { userId: u.id };
      if (editEmail.trim() && editEmail !== u.email) body.email = editEmail.trim();
      if (editName !== (u.displayName ?? "")) body.displayName = editName;
      if (editPass.trim()) body.newPassword = editPass.trim();
      if (editRole !== u.role) body.role = editRole;

      if (Object.keys(body).length <= 1) { cancelEdit(); return; }

      const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUsers(prev => prev.map(x => x.id === u.id
        ? { ...x, email: editEmail.trim() || x.email, displayName: editName || null, role: editRole }
        : x));
      toast({ title: "Сохранено" });
      cancelEdit();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string, email: string, name: string | null, isSelf: boolean) => {
    setDeleteTarget({ id, email, name, isSelf });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
      toast({ title: "Удалён", description: deleteTarget.email });
      setDeleteTarget(null);
      if (deleteTarget.isSelf) {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/auth/login";
        return;
      }
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally { setDeleting(false); }
  };

  const openProject = (p: ProjectRow) => {
    setViewProject(p);
    setViewPageId(p.data?.activePageId ?? p.data?.pages?.[0]?.id ?? null);
    setViewMode("preview");
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#080C14" }}>
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#638bff" }} />
    </div>
  );
  if (user.role !== "admin") return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "#080C14" }}>
      <Shield className="h-12 w-12" style={{ color: "#ef4444" }} />
      <p style={{ color: "#e8eaf6" }}>Доступ запрещён</p>
      <a href="/" style={{ color: "#638bff" }}>← На главную</a>
    </div>
  );

  const activePage = viewProject?.data?.pages?.find(p => p.id === viewPageId);
  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg,#080C14 0%,#0d1526 100%)" }}>
      <SiteNav />

      <div style={{ flex: 1, maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem", width: "100%" }}>

        {/* Шапка */}
        <div className="flex items-center justify-between mb-6" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" style={{ color: "#638bff", flexShrink: 0 }} />
            <div>
              <h1 style={{ color: "#e8eaf6", fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>Панель администратора</h1>
              <p style={{ color: "rgba(232,234,246,0.4)", fontSize: "0.72rem", margin: 0 }}>Просмотр и управление пользователями</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAll} title="Обновить" style={{ background: "rgba(99,139,255,0.1)", border: "1px solid rgba(99,139,255,0.25)", borderRadius: "0.5rem", padding: "0.45rem", cursor: "pointer" }}>
              <RefreshCw className="h-4 w-4" style={{ color: "#638bff" }} />
            </button>
            <a href="http://localhost:5555" target="_blank" rel="noreferrer" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "0.5rem", padding: "0.45rem 0.9rem", color: "#a78bfa", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none" }}>
              <Database className="h-3.5 w-3.5" /> Prisma <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Статистика */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {([
              [Users,      "Пользователи", stats.users,     "#638bff"],
              [FolderOpen, "Проекты",       stats.projects,  "#10b981"],
              [Radio,      "Онлайн",        stats.online,    "#22c55e"],
              [Database,   "Шаблоны",       stats.templates, "#8b5cf6"],
            ] as const).map(([Icon, label, val, color]) => (
              <div key={label} style={{ ...glass, padding: "1rem", textAlign: "center" }}>
                <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: color as string }} />
                <p style={{ color: "#e8eaf6", fontSize: "1.6rem", fontWeight: 700, margin: 0, lineHeight: 1 }}>{val as number}</p>
                <p style={{ color: "rgba(232,234,246,0.45)", fontSize: "0.7rem", marginTop: "0.2rem" }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Вкладки */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {([["users", "Пользователи", Users], ["projects", "Проекты", FolderOpen]] as const).map(([tab, label, Icon]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? "rgba(99,139,255,0.2)" : "rgba(99,139,255,0.06)", border: `1px solid ${activeTab === tab ? "rgba(99,139,255,0.5)" : "rgba(99,139,255,0.15)"}`, borderRadius: "0.5rem", padding: "0.45rem 1rem", color: activeTab === tab ? "#638bff" : "rgba(232,234,246,0.5)", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* ── ПОЛЬЗОВАТЕЛИ ── */}
        {activeTab === "users" && (
          <div style={{ ...glass, padding: "1.25rem" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: "#e8eaf6", fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>Пользователи ({users.length})</h2>
              {fetching && <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#638bff" }} />}
            </div>

            {/* Карточки пользователей (адаптивные) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {users.map(u => {
                const isEditing = editingId === u.id;
                const isLastAdmin = u.role === "admin" && adminCount <= 1;
                const isSelf = u.id === user.id;
                return (
                  <div key={u.id} style={{ background: isEditing ? "rgba(99,139,255,0.06)" : "rgba(99,139,255,0.03)", border: `1px solid ${isEditing ? "rgba(99,139,255,0.35)" : "rgba(99,139,255,0.12)"}`, borderRadius: "0.75rem", overflow: "hidden", transition: "border-color 0.2s" }}>

                    {/* Строка пользователя */}
                    <div style={{ padding: "0.85rem 1rem" }}>
                      {/* Верхняя часть: аватар + инфо + кнопки */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {/* Аватар */}
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.role === "admin" ? "linear-gradient(135deg,#638bff,#8b5cf6)" : "rgba(99,139,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", color: "#e8eaf6", fontWeight: 700, flexShrink: 0 }}>
                          {(u.displayName || u.email)[0].toUpperCase()}
                        </div>

                        {/* Имя + email */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "#e8eaf6", fontSize: "0.85rem", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.displayName || "—"}
                          </p>
                          <p style={{ color: "rgba(232,234,246,0.4)", fontSize: "0.73rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.email}
                          </p>
                        </div>

                        {/* Кнопки — всегда справа, не переносятся */}
                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, marginLeft: "auto" }}>
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(u)} disabled={saving} style={btnSm("34,197,94")}>
                                {saving ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Check style={{ width: 12, height: 12 }} />}
                                Сохранить
                              </button>
                              <button onClick={cancelEdit} style={btnSm("232,234,246")}>
                                <X style={{ width: 12, height: 12 }} /> Отмена
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(u)} style={btnSm("99,139,255")}>
                                <Edit2 style={{ width: 12, height: 12 }} /> Изменить
                              </button>
                              <button onClick={() => handleDelete(u.id, u.email, u.displayName, isSelf)} title={isSelf ? "Удалить свой аккаунт" : "Удалить"} style={btnSm("239,68,68")}>
                                <Trash2 style={{ width: 12, height: 12 }} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Нижняя часть: роль + дата */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.45rem", paddingLeft: "3rem" }}>
                        <span style={{ background: u.role === "admin" ? "rgba(99,139,255,0.2)" : "rgba(255,255,255,0.06)", color: u.role === "admin" ? "#638bff" : "rgba(232,234,246,0.45)", padding: "0.1rem 0.5rem", borderRadius: "999px", fontSize: "0.67rem", fontWeight: 600 }}>
                          {u.role === "admin" ? "Admin" : "User"}
                        </span>
                        <span style={{ color: "rgba(232,234,246,0.25)", fontSize: "0.67rem" }}>
                          {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>

                    {/* Форма редактирования */}
                    {isEditing && (
                      <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid rgba(99,139,255,0.12)" }}>
                        <div style={{ paddingTop: "0.85rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.65rem" }}>
                          <div>
                            <label style={{ color: "rgba(232,234,246,0.45)", fontSize: "0.67rem", display: "block", marginBottom: "0.3rem" }}>Email</label>
                            <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inp} placeholder="email@example.com" />
                          </div>
                          <div>
                            <label style={{ color: "rgba(232,234,246,0.45)", fontSize: "0.67rem", display: "block", marginBottom: "0.3rem" }}>Отображаемое имя</label>
                            <input value={editName} onChange={e => setEditName(e.target.value)} style={inp} placeholder="Имя пользователя" />
                          </div>
                          <div>
                            <label style={{ color: "rgba(232,234,246,0.45)", fontSize: "0.67rem", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.3rem", whiteSpace: "nowrap" }}>
                              <KeyRound style={{ width: 10, height: 10, flexShrink: 0 }} />
                              Новый пароль
                            </label>
                            <input type="password" value={editPass} onChange={e => setEditPass(e.target.value)} style={inp} placeholder="Оставьте пустым, чтобы не менять" />
                          </div>
                          <div>
                            <label style={{ color: "rgba(232,234,246,0.45)", fontSize: "0.67rem", display: "block", marginBottom: "0.3rem" }}>Роль</label>
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value)}
                              disabled={isSelf || isLastAdmin}
                              style={{ ...inp, cursor: isSelf || isLastAdmin ? "not-allowed" : "pointer", opacity: isSelf || isLastAdmin ? 0.5 : 1 }}
                            >
                              <option value="user">Пользователь</option>
                              <option value="admin">Администратор</option>
                            </select>
                            {(isSelf || isLastAdmin) && (
                              <p style={{ color: "rgba(232,234,246,0.3)", fontSize: "0.65rem", marginTop: "0.2rem" }}>
                                {isSelf ? "Нельзя изменить свою роль" : "Нельзя убрать единственного администратора"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {!fetching && users.length === 0 && (
                <p style={{ color: "rgba(232,234,246,0.3)", textAlign: "center", padding: "2rem 0", fontSize: "0.875rem" }}>Нет пользователей</p>
              )}
            </div>
          </div>
        )}

        {/* ── ПРОЕКТЫ ── */}
        {activeTab === "projects" && (
          <div style={{ ...glass, padding: "1.25rem" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: "#e8eaf6", fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>Все проекты ({projects.length})</h2>
              {fetching && <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#638bff" }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {projects.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "rgba(99,139,255,0.03)", border: "1px solid rgba(99,139,255,0.1)", borderRadius: "0.6rem", flexWrap: "wrap" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,139,255,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(99,139,255,0.1)")}>
                  <FolderOpen className="h-4 w-4" style={{ color: "#638bff", flexShrink: 0 }} />
                  <span style={{ color: "#e8eaf6", fontSize: "0.85rem", fontWeight: 500, flex: 1, minWidth: 120 }}>{p.name}</span>
                  <span style={{ color: "rgba(232,234,246,0.4)", fontSize: "0.72rem" }}>{p.data?.pages?.length ?? 0} стр.</span>
                  <span style={{ color: "rgba(232,234,246,0.4)", fontSize: "0.72rem", flex: 1 }}>{p.userEmail ?? "—"}</span>
                  <span style={{ color: "rgba(232,234,246,0.3)", fontSize: "0.7rem" }}>{new Date(p.updatedAt).toLocaleDateString("ru-RU")}</span>
                  <button onClick={() => openProject(p)} style={btnSm("99,139,255")}>
                    <Eye style={{ width: 12, height: 12 }} /> Просмотр
                  </button>
                </div>
              ))}
              {!fetching && projects.length === 0 && (
                <p style={{ color: "rgba(232,234,246,0.3)", textAlign: "center", padding: "2rem 0", fontSize: "0.875rem" }}>Нет проектов</p>
              )}
            </div>
          </div>
        )}
      </div>

      <SiteFooter />

      {/* ── Оверлей подтверждения удаления ── */}
      {deleteTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div style={{ background: "#0d1526", border: "1px solid rgba(239,68,68,0.35)", borderRadius: "1.25rem", width: "100%", maxWidth: 420, padding: "2rem", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>

            {/* Иконка */}
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <Trash2 style={{ width: 22, height: 22, color: "#ef4444" }} />
            </div>

            {/* Заголовок */}
            <h3 style={{ color: "#e8eaf6", fontWeight: 700, fontSize: "1.1rem", textAlign: "center", margin: "0 0 0.5rem" }}>
              {deleteTarget.isSelf ? "Удалить свой аккаунт?" : "Удалить пользователя?"}
            </h3>

            {/* Описание */}
            <p style={{ color: "rgba(232,234,246,0.5)", fontSize: "0.85rem", textAlign: "center", lineHeight: 1.6, margin: "0 0 0.35rem" }}>
              {deleteTarget.isSelf
                ? "Вы удаляете собственный аккаунт. После удаления вы будете автоматически разлогинены."
                : "Это действие нельзя отменить. Все данные пользователя будут удалены безвозвратно."}
            </p>

            {/* Данные пользователя */}
            <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "0.65rem", padding: "0.75rem 1rem", margin: "1rem 0 1.5rem", textAlign: "center" }}>
              {deleteTarget.name && (
                <p style={{ color: "#e8eaf6", fontWeight: 600, fontSize: "0.9rem", margin: "0 0 0.15rem" }}>{deleteTarget.name}</p>
              )}
              <p style={{ color: "rgba(232,234,246,0.45)", fontSize: "0.8rem", margin: 0 }}>{deleteTarget.email}</p>
            </div>

            {/* Кнопки */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.75rem", padding: "0.7rem", color: "rgba(232,234,246,0.7)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ flex: 1, background: "linear-gradient(135deg,#dc2626,#ef4444)", border: "none", borderRadius: "0.75rem", padding: "0.7rem", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
              >
                {deleting ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <Trash2 style={{ width: 15, height: 15 }} />}
                {deleteTarget.isSelf ? "Удалить мой аккаунт" : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Оверлей просмотра проекта ── */}
      {viewProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.75rem" }}
          onClick={e => { if (e.target === e.currentTarget) setViewProject(null); }}>
          <div style={{ background: "#0a1020", border: "1px solid rgba(99,139,255,0.25)", borderRadius: "1.25rem", width: "100%", maxWidth: 1100, height: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>

            {/* Заголовок */}
            <div style={{ padding: "0.8rem 1.25rem", borderBottom: "1px solid rgba(99,139,255,0.15)", display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0, flexWrap: "wrap" }}>
              <FolderOpen className="h-4 w-4" style={{ color: "#638bff", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#e8eaf6", fontWeight: 700, fontSize: "0.95rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{viewProject.name}</p>
                <p style={{ color: "rgba(232,234,246,0.35)", fontSize: "0.67rem", margin: 0 }}>{viewProject.userEmail} · {viewProject.data?.pages?.length ?? 0} стр.</p>
              </div>
              <div style={{ display: "flex", gap: "0.35rem", background: "rgba(99,139,255,0.06)", border: "1px solid rgba(99,139,255,0.15)", borderRadius: "0.5rem", padding: "0.2rem" }}>
                {([["preview", "Предпросмотр", Monitor], ["elements", "Элементы", FileText]] as const).map(([mode, label, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{ background: viewMode === mode ? "rgba(99,139,255,0.25)" : "none", border: `1px solid ${viewMode === mode ? "rgba(99,139,255,0.4)" : "transparent"}`, borderRadius: "0.35rem", padding: "0.25rem 0.65rem", color: viewMode === mode ? "#638bff" : "rgba(232,234,246,0.4)", fontSize: "0.72rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Icon className="h-3 w-3" /> {label}
                  </button>
                ))}
              </div>
              <button onClick={() => setViewProject(null)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "0.5rem", padding: "0.35rem 0.65rem", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", flexShrink: 0 }}>
                <X className="h-3.5 w-3.5" /> Закрыть
              </button>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Страницы */}
              <div style={{ width: 170, flexShrink: 0, borderRight: "1px solid rgba(99,139,255,0.12)", padding: "0.75rem 0.5rem", overflowY: "auto" }}>
                <p style={{ color: "rgba(232,234,246,0.3)", fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem", paddingLeft: "0.25rem" }}>Страницы</p>
                {(viewProject.data?.pages ?? []).map(page => (
                  <button key={page.id} onClick={() => setViewPageId(page.id)} style={{ width: "100%", textAlign: "left", background: viewPageId === page.id ? "rgba(99,139,255,0.15)" : "none", border: `1px solid ${viewPageId === page.id ? "rgba(99,139,255,0.4)" : "transparent"}`, borderRadius: "0.4rem", padding: "0.4rem 0.55rem", cursor: "pointer", marginBottom: "0.15rem" }}>
                    <div style={{ color: viewPageId === page.id ? "#638bff" : "#e8eaf6", fontSize: "0.78rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.name}</div>
                    <div style={{ color: "rgba(232,234,246,0.28)", fontSize: "0.62rem" }}>{page.path}</div>
                  </button>
                ))}
              </div>

              {/* Контент */}
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {!activePage ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(232,234,246,0.2)", fontSize: "0.875rem" }}>Выберите страницу</div>
                ) : viewMode === "preview" ? (
                  <iframe key={activePage.id} srcDoc={buildPreviewHtml(activePage)} style={{ flex: 1, border: "none", width: "100%", background: "#080C14" }} title={activePage.name} />
                ) : (
                  <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                    <p style={{ color: "#e8eaf6", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.2rem" }}>{activePage.name}</p>
                    <p style={{ color: "rgba(232,234,246,0.3)", fontSize: "0.68rem", marginBottom: "0.85rem" }}>{activePage.path} · {countEls(activePage.elements)} эл.</p>
                    {activePage.elements.length === 0
                      ? <p style={{ color: "rgba(232,234,246,0.2)", textAlign: "center", padding: "2rem 0" }}>Страница пустая</p>
                      : <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {activePage.elements.map((el: any, i: number) => <ElRow key={el.id ?? i} el={el} depth={0} />)}
                        </div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
