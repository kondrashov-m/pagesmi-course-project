
"use client";

import Link from "next/link";
import { PenSquare, Save, FolderOpen, Download, UserCircle, Menu, LogOut, ShieldCheckIcon, RotateCcw, RotateCw, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  onToggleMobileLeftSidebar: () => void;
  onToggleMobileRightSidebar: () => void;
  onSaveProject: () => void;
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

    // --- НАЧАЛО ИСПРАВЛЕНИЯ ---
    if (typeof window !== "undefined") { // Убедимся, что window существует (для SSR/SSG безопасности, хотя тут client component)
        if (!window.confirm("Данная функция находится в разработке. Результат может быть не очень качественным. Продолжить?")) {
          toast({
            title: "Экспорт отменен",
            description: "Вы отменили экспорт кода.",
          });
          return; 
        }
    }
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

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


  const UserMenuItems = () => (
    <>
      <DropdownMenuLabel>Моя учетная запись {user?.displayName ? `(${user.displayName})` : ''}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {user ? (
        <>
          <DropdownMenuItem asChild>
            <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Личный кабинет</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Выход
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuItem asChild>
            <Link href="/auth/login">Вход</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/auth/register">Регистрация</Link>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <PenSquare className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">PagesMi</h1>
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo || authLoading} aria-label="Отменить">
                <RotateCcw className="h-5 w-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo || authLoading} aria-label="Вернуть">
                <RotateCw className="h-5 w-5" />
             </Button>
             {user && (
                <Button variant="ghost" size="icon" onClick={onSaveProject} disabled={authLoading} aria-label="Сохранить проект">
                    <Save className="h-5 w-5" />
                </Button>
             )}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={authLoading} aria-label="Меню пользователя">
                  {authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserCircle className="h-6 w-6" />}
                  <span className="sr-only">Меню пользователя</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <UserMenuItems />
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" onClick={onToggleMobileLeftSidebar} aria-label="Открыть левую панель" disabled={authLoading}>
              <Menu className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" onClick={onToggleMobileRightSidebar} aria-label="Открыть правую панель" disabled={authLoading}>
              <Menu className="h-6 w-6 transform scale-x-[-1]" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo || authLoading}>
              <RotateCcw className="mr-2 h-4 w-4" /> Отменить
            </Button>
            <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo || authLoading}>
              <RotateCw className="mr-2 h-4 w-4" /> Вернуть
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="outline" size="sm" onClick={onSaveProject} disabled={!user || authLoading}>
              <Save className="mr-2 h-4 w-4" /> Сохранить проект
            </Button>
            <Button variant="outline" size="sm" asChild disabled={authLoading}>
              <Link href="/dashboard">
                <FolderOpen className="mr-2 h-4 w-4" /> Загрузить проект
              </Link>
            </Button>
            <Button variant="default" size="sm" onClick={handleExportCode} disabled={authLoading}>
              <Download className="mr-2 h-4 w-4" /> Экспорт кода
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" disabled={authLoading} aria-label="Меню пользователя">
                   {authLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <UserCircle className="h-7 w-7" />}
                  <span className="sr-only">Меню пользователя</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <UserMenuItems />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
