
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SitePage } from "@/types/canvas-element";
import { FilePlus2, FileText, CheckCircle, Settings, Edit2, Save, X } from "lucide-react";
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
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editableName, setEditableName] = useState("");
  const [editablePath, setEditablePath] = useState("");

  const activePageDetails = sitePages.find(p => p.id === activePageId);

  useEffect(() => {
    if (!editingPageId && activePageDetails) {
      setEditableName(activePageDetails.name);
      setEditablePath(activePageDetails.path);
    }
  }, [editingPageId, activePageId, activePageDetails]);

  const handleStartEdit = (page: SitePage) => {
    setEditingPageId(page.id);
    setEditableName(page.name);
    setEditablePath(page.path);
    if (page.id !== activePageId) onSelectPage(page.id);
  };

  const handleSaveEdit = () => {
    if (!editingPageId) return;
    let newPath = editablePath.trim();
    if (!newPath.startsWith("/")) newPath = `/${newPath}`;
    newPath = `/${newPath.replace(/^\/+|\/+$/g, "")}`;
    onUpdatePageDetails(editingPageId, { name: editableName.trim(), path: newPath });
    setEditingPageId(null);
  };

  const handleCancelEdit = () => {
    setEditingPageId(null);
    if (activePageDetails) {
      setEditableName(activePageDetails.name);
      setEditablePath(activePageDetails.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Site settings */}
      <div className="px-4 py-3 border-b border-[rgba(99,139,255,0.15)]">
        <p className="section-label mb-2 flex items-center gap-1.5">
          <Settings className="h-3 w-3 text-blue-400" />
          Настройки сайта
        </p>
        <Label htmlFor="siteNameInput" className="text-[10px] text-[var(--text-secondary)]">
          Название сайта
        </Label>
        <Input
          id="siteNameInput"
          type="text"
          value={siteName}
          onChange={(e) => onUpdateSiteName(e.target.value)}
          placeholder="Название вашего сайта"
          className="mt-1 h-8 text-xs bg-[rgba(15,22,48,0.6)] border-[rgba(99,139,255,0.25)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[rgba(99,139,255,0.5)] focus:ring-0"
        />
      </div>

      {/* Active page edit */}
      {activePageDetails && (
        <div className="px-4 py-3 border-b border-[rgba(99,139,255,0.15)]">
          <p className="section-label mb-2 flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-blue-400" />
            Текущая страница
          </p>
          {editingPageId === activePageId ? (
            <div className="space-y-2">
              <div>
                <Label htmlFor="pageNameInput" className="text-[10px] text-[var(--text-secondary)]">
                  Название
                </Label>
                <Input
                  id="pageNameInput"
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="mt-1 h-8 text-xs bg-[rgba(15,22,48,0.6)] border-[rgba(99,139,255,0.25)] text-[var(--text-primary)] focus:border-[rgba(99,139,255,0.5)] focus:ring-0"
                />
              </div>
              <div>
                <Label htmlFor="pagePathInput" className="text-[10px] text-[var(--text-secondary)]">
                  URL путь
                </Label>
                <Input
                  id="pagePathInput"
                  type="text"
                  value={editablePath}
                  onChange={(e) => setEditablePath(e.target.value)}
                  className="mt-1 h-8 text-xs bg-[rgba(15,22,48,0.6)] border-[rgba(99,139,255,0.25)] text-[var(--text-primary)] focus:border-[rgba(99,139,255,0.5)] focus:ring-0"
                />
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 glass-pill active rounded-xl flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white"
                >
                  <Save className="h-3 w-3" /> Сохранить
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="glass-pill rounded-xl p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleStartEdit(activePageDetails)}
              className="glass-card w-full rounded-xl flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Edit2 className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {activePageDetails.name} <span className="text-[var(--text-muted)]">({activePageDetails.path})</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto glass-scroll px-4 py-3">
        <p className="section-label mb-2">Страницы сайта</p>
        {sitePages.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">
            Нет страниц. Добавьте первую!
          </p>
        ) : (
          <div className="space-y-1.5">
            {sitePages.map((page) => {
              const isActive = page.id === activePageId;
              return (
                <button
                  key={page.id}
                  onClick={() => {
                    if (editingPageId && editingPageId !== page.id) handleCancelEdit();
                    onSelectPage(page.id);
                    if (editingPageId === page.id) setEditingPageId(null);
                  }}
                  className={`glass-card w-full rounded-xl flex items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-200 ${
                    isActive ? "border-[rgba(99,139,255,0.5)] bg-[rgba(59,130,246,0.12)]" : ""
                  }`}
                >
                  {isActive ? (
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                  )}
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className={`text-xs truncate ${isActive ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-secondary)]"}`}>
                      {page.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate">{page.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add page button */}
      <div className="px-4 py-3 border-t border-[rgba(99,139,255,0.15)] shrink-0">
        <button
          onClick={() => { if (editingPageId) handleCancelEdit(); onAddPage(); }}
          className="glass-pill w-full rounded-xl flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[var(--text-primary)] hover:text-white"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          Добавить страницу
        </button>
      </div>
    </div>
  );
}
