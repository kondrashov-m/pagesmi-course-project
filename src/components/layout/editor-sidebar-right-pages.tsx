
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { SitePage } from "@/types/canvas-element";
import { FilePlus2, FileText, CheckCircle, Settings, Edit2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface EditorSidebarRightPagesProps {
  isOpen: boolean;
  sitePages: SitePage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  siteName: string;
  onUpdateSiteName: (newName: string) => void;
  onUpdatePageDetails: (pageId: string, details: { name?: string; path?: string }) => void;
  isMobile?: boolean;
}

export default function EditorSidebarRightPages({
  isOpen,
  sitePages,
  activePageId,
  onSelectPage,
  onAddPage,
  siteName,
  onUpdateSiteName,
  onUpdatePageDetails,
  isMobile = false,
}: EditorSidebarRightPagesProps) {
  const sidebarClass = cn(
    "h-full w-80 border-l bg-card shadow-md flex flex-col transition-transform duration-300 ease-in-out transform",
    isOpen ? "translate-x-0" : "translate-x-full",
    isMobile ? "fixed inset-y-0 right-0 z-40" : "relative"
  );

  const scrollAreaHeight = isMobile
    ? "h-[calc(100vh-18rem)]"
    : "h-[calc(100vh-var(--header-height,4rem)-var(--card-header-height,6rem)-var(--site-settings-height,7rem)-var(--card-footer-height,5rem)-var(--active-page-edit-height,0rem))]";

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editableName, setEditableName] = useState("");
  const [editablePath, setEditablePath] = useState("");

  const activePageDetails = sitePages.find(p => p.id === activePageId);

  useEffect(() => {
    if (editingPageId && activePageDetails && editingPageId === activePageId) {
      setEditableName(activePageDetails.name);
      setEditablePath(activePageDetails.path);
    } else if (!editingPageId && activePageDetails) {
        setEditableName(activePageDetails.name);
        setEditablePath(activePageDetails.path);
    }
  }, [editingPageId, activePageId, activePageDetails]);


  const handleStartEdit = (page: SitePage) => {
    setEditingPageId(page.id);
    setEditableName(page.name);
    setEditablePath(page.path);
    if (page.id !== activePageId) {
        onSelectPage(page.id); 
    }
  };

  const handleSaveEdit = () => {
    if (editingPageId) {
      let newPath = editablePath.trim();
      if (!newPath.startsWith("/")) {
        newPath = `/${newPath}`;
      }
      newPath = `/${newPath.replace(/^\/+|\/+$/g, '')}`; 

      onUpdatePageDetails(editingPageId, { name: editableName.trim(), path: newPath });
      setEditingPageId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPageId(null);
    if (activePageDetails) {
        setEditableName(activePageDetails.name);
        setEditablePath(activePageDetails.path);
    }
  };

  const activePageEditSectionHeight = activePageId ? '8rem' : '0rem';


  if (!isOpen) {
    return null;
  }

  return (
    <aside className={sidebarClass}>
      <Card className="h-full flex flex-col shadow-none border-none">
        <CardHeader style={{ '--card-header-height': '6rem' } as React.CSSProperties}>
          <CardTitle className="font-headline text-lg">Управление страницами</CardTitle>
          <CardDescription>Управляйте страницами вашего сайта и их настройками.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-4 border-b" style={{'--site-settings-height': '7rem'} as React.CSSProperties}>
            <h3 className="text-md font-semibold mb-2 flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Настройки Сайта
            </h3>
            <div className="space-y-2">
                <div>
                    <Label htmlFor="siteNameInput" className="text-xs">Название сайта</Label>
                    <Input
                        id="siteNameInput"
                        type="text"
                        value={siteName}
                        onChange={(e) => onUpdateSiteName(e.target.value)}
                        placeholder="Название вашего сайта"
                        className="mt-1 text-sm h-9"
                    />
                </div>
            </div>
        </div>

        {activePageDetails && (
          <div 
            className="px-6 py-4 border-b space-y-2"
            style={{'--active-page-edit-height': activePageEditSectionHeight } as React.CSSProperties}
          >
            <h3 className="text-md font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Редактировать страницу: <span className="ml-1 font-normal">{activePageDetails.name}</span>
            </h3>
             {editingPageId === activePageId ? (
                <>
                    <div>
                        <Label htmlFor="pageNameInput" className="text-xs">Название страницы</Label>
                        <Input
                            id="pageNameInput"
                            type="text"
                            value={editableName}
                            onChange={(e) => setEditableName(e.target.value)}
                            className="mt-1 text-sm h-9"
                        />
                    </div>
                    <div>
                        <Label htmlFor="pagePathInput" className="text-xs">Путь (URL)</Label>
                        <Input
                            id="pagePathInput"
                            type="text"
                            value={editablePath}
                            onChange={(e) => setEditablePath(e.target.value)}
                            className="mt-1 text-sm h-9"
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleSaveEdit}><Save className="mr-2 h-4 w-4" />Сохранить</Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>Отмена</Button>
                    </div>
                </>
             ) : (
                 <Button size="sm" variant="outline" onClick={() => handleStartEdit(activePageDetails)} className="w-full">
                     <Edit2 className="mr-2 h-4 w-4" /> Редактировать название/URL
                 </Button>
             )}
          </div>
        )}


        <CardContent className="flex-grow p-4 pt-2 overflow-hidden">
          <ScrollArea 
            className={scrollAreaHeight}
            style={{ '--active-page-edit-height': activePageEditSectionHeight } as React.CSSProperties}
          >
            {sitePages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Пока нет страниц. Начните с добавления новой!
              </p>
            ) : (
              <ul className="space-y-2">
                {sitePages.map((page) => (
                  <li key={page.id}>
                    <Button
                      variant={page.id === activePageId ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left h-auto py-2 px-3",
                        page.id === activePageId && "font-semibold"
                      )}
                      onClick={() => {
                        if (editingPageId && editingPageId !== page.id) handleCancelEdit(); 
                        onSelectPage(page.id);
                        if (editingPageId === page.id) setEditingPageId(null); 
                      }}
                    >
                      {page.id === activePageId ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm truncate">{page.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{page.path}</span>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4" style={{ '--card-footer-height': '5rem' } as React.CSSProperties}>
          <Button onClick={() => { if(editingPageId) handleCancelEdit(); onAddPage();}} className="w-full mt-1">
            <FilePlus2 className="mr-2 h-4 w-4" />
            Добавить страницу
          </Button>
        </CardFooter>
      </Card>
    </aside>
  );
}


    
