
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import AppHeader from "@/components/layout/app-header"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowLeft, Loader2, Edit, FolderOpen } from "lucide-react";
import type { SiteData } from "@/types/canvas-element"; // For dummy header data

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedProject, setSavedProject] = useState<SiteData | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/dashboard");
    } else if (!authLoading && user) {
      setIsLoadingProject(true);
      try {
        if (typeof window !== 'undefined') {
            const storedData = localStorage.getItem('pageForgeProject_' + user.id);
            if (storedData) {
                const project = JSON.parse(storedData) as SiteData;
                if (project && project.siteName && project.pages) {
                    setSavedProject(project);
                } else {
                    setSavedProject(null);
                }
            } else {
                setSavedProject(null);
            }
        }
      } catch (error) {
        console.error("Ошибка загрузки проекта для дашборда:", error);
        setSavedProject(null);
      } finally {
        setIsLoadingProject(false);
      }
    }
  }, [user, authLoading, router]);

  const handleEditProject = () => {
    router.push("/"); // page.tsx will handle loading from localStorage
  };

  if (authLoading || (!user && !authLoading)) { // Show loader if auth is loading or redirecting
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Загрузка...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Проверяем ваш статус аутентификации и загружаем данные кабинета.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dummySiteDataForHeader: SiteData = { // For AppHeader, actual save/load is via localStorage
    pages: savedProject?.pages || [{ id: 'dashboard_placeholder', name: 'Кабинет', path: '/dashboard', elements: [], canvasStyles: {}, gridSettings: {showGrid:false, gridSize:"20"} }],
    activePageId: savedProject?.activePageId || 'dashboard_placeholder',
    siteName: savedProject?.siteName || 'PagesMi Кабинет',
  };


  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader
        onUndo={() => {}} // Not applicable on dashboard
        onRedo={() => {}} // Not applicable on dashboard
        canUndo={false}
        canRedo={false}
        currentSiteData={dummySiteDataForHeader}
        onToggleMobileLeftSidebar={() => {}} 
        onToggleMobileRightSidebar={() => {}}
        onSaveProject={() => {}} // Save happens in editor
      />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-3xl shadow-xl">
          <CardHeader className="text-center">
            <LayoutDashboard className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-headline">Личный кабинет</CardTitle>
            <CardDescription>
              Добро пожаловать, {user?.displayName || user?.email}!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isLoadingProject ? (
                <div className="flex items-center justify-center p-6">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <p>Загрузка данных проекта...</p>
                </div>
            ) : savedProject ? (
              <div className="mt-6 p-6 border border-dashed rounded-md bg-muted/50">
                <h3 className="text-xl font-semibold text-foreground mb-2">Ваш сохраненный проект:</h3>
                <p className="text-2xl text-primary font-headline mb-4">{savedProject.siteName}</p>
                <p className="text-sm text-muted-foreground mb-1">Количество страниц: {savedProject.pages.length}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  (Последнее сохранение будет загружено в редактор)
                </p>
                <Button onClick={handleEditProject} size="lg">
                  <Edit className="mr-2 h-5 w-5" />
                  Редактировать проект
                </Button>
              </div>
            ) : (
              <div className="mt-6 p-6 border border-dashed rounded-md bg-muted/50 text-center">
                <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Сохраненные проекты не найдены.</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Перейдите в <Link href="/" className="text-primary hover:underline">редактор</Link>, чтобы создать и сохранить свой первый проект.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться в редактор
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
       <footer className="bg-card border-t p-3 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} PagesMi. Все права защищены.
      </footer>
    </div>
  );
}

    