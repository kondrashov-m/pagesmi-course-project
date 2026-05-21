
"use client";

import Link from "next/link";
import {
  SquarePen,
  Save,
  Download,
  UserCircle,
  Menu,
  LogOut,
  RotateCcw,
  RotateCw,
  LayoutDashboard,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  LayoutTemplate,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";
import type { SiteData } from "@/types/canvas-element";
import { exportSiteToZip } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

interface AppHeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentSiteData: SiteData;
  onToggleMobileLeftSidebar?: () => void;
  onToggleMobileRightSidebar?: () => void;
  onSaveProject: () => void;
  deviceView?: "desktop" | "tablet" | "mobile";
  onDeviceViewChange?: (view: "desktop" | "tablet" | "mobile") => void;
}

export default function AppHeader({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentSiteData,
  onToggleMobileLeftSidebar,
  onToggleMobileRightSidebar,
  onSaveProject,
  deviceView = "desktop",
  onDeviceViewChange,
}: AppHeaderProps) {
  const isMobile = useIsMobile();
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const handleExportCode = async () => {
    if (!currentSiteData) {
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Нет данных сайта для экспорта.",
      });
      return;
    }

    if (typeof window !== "undefined") {
      if (
        !window.confirm(
          "Данная функция находится в разработке. Результат может быть не очень качественным. Продолжить?"
        )
      ) {
        toast({
          title: "Экспорт отменен",
          description: "Вы отменили экспорт кода.",
        });
        return;
      }
    }

    try {
      await exportSiteToZip(currentSiteData);
      toast({
        title: "Экспорт успешен",
        description: "Код вашего сайта был загружен в ZIP-архиве.",
      });
    } catch (error) {
      console.error("Ошибка экспорта кода:", error);
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать код сайта.",
      });
    }
  };

  const deviceButtons: {
    view: "desktop" | "tablet" | "mobile";
    Icon: React.FC<{ className?: string }>;
    label: string;
  }[] = [
    { view: "desktop", Icon: Monitor, label: "Десктоп" },
    { view: "tablet", Icon: Tablet, label: "Планшет" },
    { view: "mobile", Icon: Smartphone, label: "Мобильный" },
  ];

  if (isMobile) {
    return (
      <header className="glass-header sticky top-0 z-50 h-14 flex items-center justify-between px-3">
        {/* Left: mobile hamburger + undo/redo */}
        <div className="flex items-center gap-1">
          {onToggleMobileLeftSidebar && (
            <button
              onClick={onToggleMobileLeftSidebar}
              className="glass-pill rounded-xl p-2 text-[var(--text-secondary)]"
              aria-label="Открыть левую панель"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onUndo}
            disabled={!canUndo || authLoading}
            className="glass-pill rounded-xl p-2 text-[var(--text-secondary)] disabled:opacity-40"
            aria-label="Отменить"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo || authLoading}
            className="glass-pill rounded-xl p-2 text-[var(--text-secondary)] disabled:opacity-40"
            aria-label="Вернуть"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Center: logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <SquarePen className="h-5 w-5 text-[var(--text-primary)]" />
          <span className="text-base font-bold text-[var(--text-primary)]">PagesMi</span>
        </Link>

        {/* Right: user + right sidebar */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="glass-pill rounded-full p-2 text-[var(--text-secondary)]"
                disabled={authLoading}
                aria-label="Меню пользователя"
              >
                {authLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCircle className="h-4 w-4" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[rgba(10,14,30,0.95)] border-[rgba(99,139,255,0.3)] text-[var(--text-primary)]">
              <DropdownMenuLabel>
                {user?.displayName ? user.displayName : "Моя учетная запись"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[rgba(99,139,255,0.2)]" />
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      Личный кабинет
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/templates" className="flex items-center gap-2 cursor-pointer">
                      <LayoutTemplate className="h-4 w-4" />
                      Шаблоны
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[rgba(99,139,255,0.2)]" />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Выход
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="cursor-pointer">Вход</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register" className="cursor-pointer">Регистрация</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {onToggleMobileRightSidebar && (
            <button
              onClick={onToggleMobileRightSidebar}
              className="glass-pill rounded-xl p-2 text-[var(--text-secondary)]"
              aria-label="Открыть правую панель"
            >
              <Menu className="h-4 w-4 scale-x-[-1]" />
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="glass-header sticky top-0 z-50 h-14 flex items-center justify-between px-4 gap-3">
      {/* LEFT: undo/redo + logo */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo || authLoading}
          className="glass-pill rounded-full p-2 text-[var(--text-secondary)] disabled:opacity-40"
          title="Отменить (Ctrl+Z)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo || authLoading}
          className="glass-pill rounded-full p-2 text-[var(--text-secondary)] disabled:opacity-40"
          title="Вернуть (Ctrl+Y)"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-[rgba(99,139,255,0.2)] mx-1" />

        <Link href="/" className="flex items-center gap-2">
          <SquarePen className="h-5 w-5 text-[var(--text-primary)]" />
          <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            PagesMi
          </span>
        </Link>
      </div>

      {/* CENTER: device toggle */}
      <div className="flex items-center gap-1 glass-pill rounded-2xl px-1 py-1">
        {deviceButtons.map(({ view, Icon, label }) => (
          <button
            key={view}
            onClick={() => onDeviceViewChange?.(view)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              deviceView === view
                ? "active glass-pill"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* RIGHT: user menu + save + export */}
      <div className="flex items-center gap-2 shrink-0">
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="glass-pill rounded-full p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              disabled={authLoading}
              aria-label="Меню пользователя"
            >
              {authLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserCircle className="h-5 w-5" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[rgba(10,14,30,0.95)] border-[rgba(99,139,255,0.3)] text-[var(--text-primary)]"
          >
            <DropdownMenuLabel>
              {user?.displayName
                ? `Моя учетная запись (${user.displayName})`
                : "Моя учетная запись"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[rgba(99,139,255,0.2)]" />
            {user ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Личный кабинет
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/templates" className="flex items-center gap-2 cursor-pointer">
                    <LayoutTemplate className="h-4 w-4" />
                    Шаблоны
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[rgba(99,139,255,0.2)]" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Выход
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="cursor-pointer">Вход</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/register" className="cursor-pointer">Регистрация</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save button */}
        <button
          onClick={onSaveProject}
          disabled={!user || authLoading}
          className="glass-pill rounded-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] disabled:opacity-40"
          title="Сохранить проект"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Сохранить</span>
        </button>

        {/* Export button */}
        <button
          onClick={handleExportCode}
          disabled={authLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-purple-900/30 disabled:opacity-40"
          title="Экспорт кода"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Экспорт</span>
        </button>
      </div>
    </header>
  );
}
