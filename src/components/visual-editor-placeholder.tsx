
// Этот файл был переименован в visual-editor-canvas.tsx
// и его содержимое было обновлено.
// Этот файл больше не используется и может быть удален.

import { LayoutDashboard } from "lucide-react";

export default function VisualEditorPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border rounded-lg bg-muted/20 p-8 shadow-inner">
      <LayoutDashboard className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold text-foreground font-headline">Холст визуального редактора</h2>
      <p className="text-muted-foreground mt-2 text-center">Перетаскивайте элементы сюда, чтобы создать свою страницу.</p>
      <p className="text-sm text-muted-foreground mt-1 text-center">(Предпросмотр в реальном времени и функция перетаскивания скоро появятся!)</p>
    </div>
  );
}
