'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { CanvasElement, SitePage, SiteData, ElementType } from '@/types/canvas-element';
import VisualEditorCanvas from '@/components/visual-editor-canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Plus, Type, Image as ImageIcon, Code2 } from 'lucide-react';

export default function EditorComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState<SiteData>({
    pages: [],
    activePageId: '',
    siteName: 'My Site'
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Protect the page - redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      // Initialize with default page if empty
      if (siteData.pages.length === 0) {
        const defaultPage: SitePage = {
          id: `page_${Date.now()}`,
          name: 'Home',
          path: '/',
          elements: [],
          canvasStyles: {
            backgroundColor: '#ffffff',
            padding: '20px'
          },
          gridSettings: {
            showGrid: false,
            gridSize: '10'
          }
        };
        setSiteData({
          pages: [defaultPage],
          activePageId: defaultPage.id,
          siteName: 'My Site'
        });
      }
      setLoading(false);
    }
  }, [status, router, siteData.pages.length]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (siteData.pages.length > 0) {
      localStorage.setItem('siteData', JSON.stringify(siteData));
    }
  }, [siteData]);

  const activePage = siteData.pages.find(p => p.id === siteData.activePageId);

  if (loading || !activePage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-white text-lg">Загрузка редактора...</div>
      </div>
    );
  }

  const handleAddElement = (type: ElementType) => {
    const newElement: CanvasElement = {
      id: `element_${Date.now()}`,
      type,
      content: type === 'Heading1' ? 'Заголовок' : type === 'Paragraph' ? 'Текст' : '',
      styles: {
        padding: '10px',
        margin: '10px'
      }
    };

    const updatedPages = siteData.pages.map(page => {
      if (page.id === activePage.id) {
        return {
          ...page,
          elements: [...page.elements, newElement]
        };
      }
      return page;
    });

    setSiteData({ ...siteData, pages: updatedPages });
    setSelectedElementId(newElement.id);
  };

  const handleRemoveElement = (id: string) => {
    const updatedPages = siteData.pages.map(page => {
      if (page.id === activePage.id) {
        return {
          ...page,
          elements: page.elements.filter(el => el.id !== id)
        };
      }
      return page;
    });

    setSiteData({ ...siteData, pages: updatedPages });
    setSelectedElementId(null);
  };

  const handleUpdateElement = (element: CanvasElement) => {
    const updatedPages = siteData.pages.map(page => {
      if (page.id === activePage.id) {
        return {
          ...page,
          elements: page.elements.map(el => el.id === element.id ? element : el)
        };
      }
      return page;
    });

    setSiteData({ ...siteData, pages: updatedPages });
  };

  const handleUpdateElementContent = (id: string, content: string) => {
    const updatedPages = siteData.pages.map(page => {
      if (page.id === activePage.id) {
        return {
          ...page,
          elements: page.elements.map(el => el.id === id ? { ...el, content } : el)
        };
      }
      return page;
    });

    setSiteData({ ...siteData, pages: updatedPages });
  };

  const handleUpdateElementStyle = (id: string, newStyles: React.CSSProperties) => {
    const updatedPages = siteData.pages.map(page => {
      if (page.id === activePage.id) {
        return {
          ...page,
          elements: page.elements.map(el =>
            el.id === id ? { ...el, styles: { ...el.styles, ...newStyles } } : el
          )
        };
      }
      return page;
    });

    setSiteData({ ...siteData, pages: updatedPages });
  };

  const handleMoveElement = (id: string, direction: 'up' | 'down') => {
    const updatedPages = siteData.pages.map(page => {
      if (page.id === activePage.id) {
        const index = page.elements.findIndex(el => el.id === id);
        if (index === -1) return page;

        const newElements = [...page.elements];
        if (direction === 'up' && index > 0) {
          [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        } else if (direction === 'down' && index < newElements.length - 1) {
          [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        }

        return {
          ...page,
          elements: newElements
        };
      }
      return page;
    });

    setSiteData({ ...siteData, pages: updatedPages });
  };

  const handleCopyElement = (id: string) => {
    const element = activePage.elements.find(el => el.id === id);
    if (!element) return;

    const copiedElement: CanvasElement = {
      ...element,
      id: `element_${Date.now()}`
    };

    const updatedPages = siteData.pages.map(page => {
      if (page.id === activePage.id) {
        const index = page.elements.findIndex(el => el.id === id);
        const newElements = [...page.elements];
        newElements.splice(index + 1, 0, copiedElement);
        return {
          ...page,
          elements: newElements
        };
      }
      return page;
    });

    setSiteData({ ...siteData, pages: updatedPages });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(siteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `site-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Успех', description: 'Сайт экспортирован' });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = '/dashboard'} className="p-2 hover:bg-white/10 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Редактор сайта</h1>
          <span className="text-sm text-white/60">{activePage.name}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспортировать
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-64 border-r border-white/10 bg-slate-900/50 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-white/60">Элементы</h3>
              <div className="space-y-2">
                <Button 
                  onClick={() => handleAddElement('Heading1')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Заголовок
                </Button>
                <Button 
                  onClick={() => handleAddElement('Paragraph')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Текст
                </Button>
                <Button 
                  onClick={() => handleAddElement('Button')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  Кнопка
                </Button>
                <Button 
                  onClick={() => handleAddElement('Image')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Изображение
                </Button>
                <Button 
                  onClick={() => handleAddElement('Container')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Контейнер
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold mb-2 text-white/60">Страницы ({siteData.pages.length})</h3>
              <div className="space-y-2">
                {siteData.pages.map(page => (
                  <Button
                    key={page.id}
                    onClick={() => setSiteData({ ...siteData, activePageId: page.id })}
                    variant="outline"
                    size="sm"
                    className={`w-full justify-start ${
                      page.id === activePage.id
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'border-white/20 hover:bg-white/10'
                    } text-white`}
                  >
                    {page.name}
                  </Button>
                ))}
                <Button 
                  onClick={() => {
                    const newPage: SitePage = {
                      id: `page_${Date.now()}`,
                      name: `Страница ${siteData.pages.length + 1}`,
                      path: `/page-${siteData.pages.length}`,
                      elements: [],
                      canvasStyles: { backgroundColor: '#ffffff', padding: '20px' },
                      gridSettings: { showGrid: false, gridSize: '10' }
                    };
                    setSiteData({
                      ...siteData,
                      pages: [...siteData.pages, newPage],
                      activePageId: newPage.id
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Новая страница
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-900/20">
          <div className="p-8">
            <VisualEditorCanvas
              elements={activePage.elements}
              onRemoveElement={handleRemoveElement}
              onUpdateElement={handleUpdateElement}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElementContent={handleUpdateElementContent}
              onUpdateElementStyle={handleUpdateElementStyle}
              onMoveElement={handleMoveElement}
              onEditImage={() => {}}
              onCopyElement={handleCopyElement}
              canvasStyles={activePage.canvasStyles}
              showGrid={activePage.gridSettings.showGrid}
              gridSize={activePage.gridSettings.gridSize}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-64 border-l border-white/10 bg-slate-900/50 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-white/60">Свойства</h3>
              {selectedElementId ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Ширина</label>
                    <Input 
                      type="text" 
                      placeholder="100px или 100%" 
                      className="bg-white/5 border-white/20 text-white"
                      defaultValue={selectedElementId}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Высота</label>
                    <Input 
                      type="text" 
                      placeholder="auto" 
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Отступ</label>
                    <Input 
                      type="text" 
                      placeholder="10px" 
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/40">Выберите элемент для редактирования</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
