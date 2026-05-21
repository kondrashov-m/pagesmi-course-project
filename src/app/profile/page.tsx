"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import SiteNav, { SiteFooter } from "@/components/layout/site-nav";
import { useToast } from "@/hooks/use-toast";
import {
  UserCircle,
  ArrowLeft,
  Loader2,
  Save,
  Lock,
  Mail,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/profile");
      return;
    }
    if (user) {
      setDisplayName(user.displayName ?? "");
    }
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.createdAt) setCreatedAt(data.user.createdAt);
      })
      .catch(() => {});
  }, [user, authLoading, router]);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setIsSavingName(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUser(data.user);
      toast({ title: "Имя обновлено", description: "Отображаемое имя успешно изменено." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Ошибка", description: "Пароли не совпадают." });
      return;
    }
    setIsSavingPass(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Пароль изменён", description: "Новый пароль успешно сохранён." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setIsSavingPass(false);
    }
  };

  const glassCard: React.CSSProperties = {
    background: "var(--glass-bg)",
    border: "1px solid rgba(99,139,255,0.18)",
    backdropFilter: "blur(20px)",
    borderRadius: "1rem",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(15,22,48,0.6)",
    border: "1px solid rgba(99,139,255,0.25)",
    color: "var(--text-primary)",
    borderRadius: "0.75rem",
    padding: "0.6rem 0.9rem",
    width: "100%",
    fontSize: "0.9rem",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-secondary)",
    fontSize: "0.75rem",
    marginBottom: "0.3rem",
    display: "block",
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#080C14" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#638bff" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #080C14 0%, #0d1526 100%)" }}>
      <SiteNav />
      <div className="flex-1 p-4 md:p-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b7fff, #638bff)" }}>
            <UserCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {user?.displayName || user?.email}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Настройки профиля</p>
          </div>
        </div>

        {/* Info card */}
        <div className="p-5 mb-5" style={glassCard}>
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Информация об аккаунте
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0" style={{ color: "#638bff" }} />
              <div>
                <p style={{ ...labelStyle, marginBottom: 0 }}>Электронная почта</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{user?.email}</p>
              </div>
            </div>
            {createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "#638bff" }} />
                <div>
                  <p style={{ ...labelStyle, marginBottom: 0 }}>Дата регистрации</p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {new Date(createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "#638bff" }} />
              <div>
                <p style={{ ...labelStyle, marginBottom: 0 }}>Роль</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {user?.role === "admin" ? "Администратор" : "Пользователь"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Display name card */}
        <div className="p-5 mb-5" style={glassCard}>
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Отображаемое имя
          </h2>
          <div className="space-y-3">
            <div>
              <label style={labelStyle}>Ваше имя</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Введите имя..."
                style={inputStyle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={isSavingName || !displayName.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #3b7fff, #638bff)", color: "#fff" }}
            >
              {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Сохранить имя
            </button>
          </div>
        </div>

        {/* Password card */}
        <div className="p-5" style={glassCard}>
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Изменить пароль
          </h2>
          <div className="space-y-3">
            <div>
              <label style={labelStyle}>Текущий пароль</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Подтвердите новый пароль</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isSavingPass || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "rgba(99,139,255,0.15)", border: "1px solid rgba(99,139,255,0.3)", color: "var(--text-primary)" }}
            >
              {isSavingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Изменить пароль
            </button>
          </div>
        </div>
      </div>
      </div>
      <SiteFooter />
    </div>
  );
}