
"use client";

import { useState, useEffect, useRef, useCallback, type DragEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileSymlink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { src: string; alt: string; aiHint?: string }) => void;
  initialSrc?: string;
  initialAlt?: string;
  initialAiHint?: string;
}

export default function ImageSourceDialog({
  isOpen,
  onClose,
  onSubmit,
  initialSrc = "",
  initialAlt = "",
  initialAiHint = ""
}: ImageSourceDialogProps) {
  const [urlSrc, setUrlSrc] = useState(initialSrc);
  const [alt, setAlt] = useState(initialAlt);
  const [aiHint, setAiHint] = useState(initialAiHint);
  const [previewSrc, setPreviewSrc] = useState(initialSrc);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setUrlSrc(initialSrc);
      setAlt(initialAlt);
      setAiHint(initialAiHint);
      if (initialSrc && !initialSrc.startsWith('blob:')) {
        setPreviewSrc(initialSrc);
      } else {
        setPreviewSrc("https://placehold.co/200x200.png?text=Preview");
      }
    }
  }, [initialSrc, initialAlt, initialAiHint, isOpen]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type !== 'image/jpeg') {
        toast({
          variant: "destructive",
          title: "Неверный тип файла",
          description: "Пожалуйста, выберите JPG/JPEG файл.",
        });
        setSelectedFile(null);
        setPreviewSrc(initialSrc || "https://placehold.co/200x200.png?text=Preview");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      setUrlSrc(""); // Clear URL input if file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Не удалось загрузить файл.");
        }
        onSubmit({ src: result.url, alt, aiHint });
        toast({ title: "Успех", description: "Изображение загружено и добавлено." });
        onClose();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: error.message || "Произошла ошибка при загрузке файла.",
        });
      } finally {
        setIsUploading(false);
      }
    } else if (urlSrc) {
      if (!urlSrc.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) && !urlSrc.startsWith('data:image') && !urlSrc.startsWith('https://placehold.co')) {
          toast({ variant: "destructive", title: "Неверный URL", description: "URL должен указывать на изображение." });
          setIsUploading(false);
          return;
      }
      onSubmit({ src: urlSrc, alt, aiHint });
      setIsUploading(false);
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, выберите файл для загрузки или введите URL изображения.",
      });
      setIsUploading(false);
    }
  };

  const handleUrlSrcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrlSrc(newUrl);
    setSelectedFile(null); // Clear file selection if URL is typed
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (newUrl && (newUrl.startsWith('http://') || newUrl.startsWith('https://') || newUrl.startsWith('data:image'))) {
      setPreviewSrc(newUrl);
    } else if (!newUrl && !selectedFile) {
      setPreviewSrc("https://placehold.co/200x200.png?text=Preview");
    }
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true); // Keep it true while dragging over
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialSrc && !selectedFile ? "Изменить изображение" : "Добавить/Загрузить изображение"}</DialogTitle>
            <DialogDescription>
              Загрузите JPG-файл или введите URL изображения. Заполните альтернативный текст и подсказку для ИИ.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* File Upload Section */}
            <div 
              className={cn(
                "relative mt-1 flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-border",
                selectedFile ? "border-green-500" : ""
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className={cn("w-10 h-10 mb-3", selectedFile ? "text-green-500" : "text-muted-foreground")} />
              <p className={cn("text-sm font-semibold", selectedFile ? "text-green-600" : "text-foreground")}>
                {selectedFile ? `Файл: ${selectedFile.name}` : "Перетащите JPG файл сюда или нажмите для выбора"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedFile ? `Тип: ${selectedFile.type}, Размер: ${(selectedFile.size / 1024).toFixed(1)} KB` : "Только JPG/JPEG файлы"}
              </p>
              <Input
                id="fileUpload"
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files)}
                className="sr-only" 
                accept="image/jpeg"
              />
            </div>

            <div className="relative flex items-center">
              <span className="flex-shrink px-2 text-xs text-muted-foreground">ИЛИ</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* URL Input Section */}
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="imageUrl" className="text-right col-span-1 text-sm flex items-center justify-end">
                <FileSymlink className="w-4 h-4 mr-1 text-muted-foreground" />
                URL
              </Label>
              <Input
                id="imageUrl"
                value={urlSrc}
                onChange={handleUrlSrcChange}
                className="col-span-3 h-9 text-sm"
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedFile}
              />
            
              <Label htmlFor="altText" className="text-right col-span-1 text-sm">
                Alt текст
              </Label>
              <Input
                id="altText"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="col-span-3 h-9 text-sm"
                placeholder="Описание изображения"
              />
            
              <Label htmlFor="aiHint" className="text-right col-span-1 text-sm">
                AI Hint
              </Label>
              <Input
                id="aiHint"
                value={aiHint}
                onChange={(e) => setAiHint(e.target.value)}
                className="col-span-3 h-9 text-sm"
                placeholder="Напр. закат горы (макс 2 слова)"
              />
            </div>

            {/* Preview Section */}
            {previewSrc && (
              <div className="mt-2 p-2 border rounded-md flex justify-center items-center bg-muted/30 max-h-48 overflow-hidden">
                <Image
                  src={previewSrc}
                  alt="Предпросмотр"
                  width={180}
                  height={180}
                  className="object-contain"
                  onError={() => {
                    if (selectedFile) { // If it was a file preview that failed (unlikely for valid local files)
                       setPreviewSrc("https://placehold.co/200x200/ff0000/ffffff?text=Preview+Error");
                    } else if (urlSrc) { // If it was a URL preview that failed
                       setPreviewSrc("https://placehold.co/200x200/ff0000/ffffff?text=Error+Loading+URL");
                    }
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isUploading}>Отмена</Button>
            </DialogClose>
            <Button type="submit" disabled={isUploading || (!selectedFile && !urlSrc)}>
              {isUploading ? "Загрузка..." : (selectedFile ? "Загрузить и добавить" : "Добавить по URL")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
