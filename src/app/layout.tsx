
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Trash2, Loader2, UserPlus, KeyRound, Edit, Eye, EyeOff } from "lucide-react";
import type { UserRecord } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [vKeyPressCount, setVKeyPressCount] = useState(0);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminUsersList, setAdminUsersList] = useState<UserRecord[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const { toast } = useToast();

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const [userToChangePassword, setUserToChangePassword] = useState<UserRecord | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [showPasswordForUser, setShowPasswordForUser] = useState<Record<string, boolean>>({});


  const fetchAdminUsers = useCallback(async () => {
    setAdminLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Не удалось загрузить пользователей' }));
        throw new Error(errorData.message);
      }
      const data = await response.json();
      setAdminUsersList(data);
    } catch (error: any) {
      console.error("Ошибка загрузки пользователей для админ-панели:", error);
      toast({ variant: "destructive", title: "Ошибка", description: error.message || "Не удалось загрузить список пользователей." });
      setAdminUsersList([]);
    } finally {
      setAdminLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdminPanelOpen) {
      fetchAdminUsers();
    }
  }, [isAdminPanelOpen, fetchAdminUsers]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить пользователя с ID: ${userId}?`)) {
      return;
    }
    setAdminLoading(true);
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: 'Не удалось удалить пользователя'}));
        throw new Error(errorData.message || 'Не удалось удалить пользователя');
      }
      toast({ title: "Успех", description: "Пользователь успешно удален." });
      fetchAdminUsers();
    } catch (error: any) {
      console.error("Ошибка удаления пользователя:", error);
      toast({ variant: "destructive", title: "Ошибка", description: error.message || "Не удалось удалить пользователя." });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAddNewUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
        toast({ variant: "destructive", title: "Ошибка", description: "Email и пароль обязательны для нового пользователя."});
        return;
    }
    setAdminLoading(true);
    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newUserEmail, displayName: newUserDisplayName, password: newUserPassword }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({message: 'Не удалось добавить пользователя'}));
            throw new Error(errorData.message || 'Не удалось добавить пользователя');
        }
        toast({ title: "Успех", description: "Новый пользователь успешно добавлен." });
        setNewUserEmail('');
        setNewUserDisplayName('');
        setNewUserPassword('');
        fetchAdminUsers();
    } catch (error: any) {
        console.error("Ошибка добавления пользователя:", error);
        toast({ variant: "destructive", title: "Ошибка", description: error.message || "Не удалось добавить пользователя." });
    } finally {
        setAdminLoading(false);
    }
  };

  const openChangePasswordDialog = (user: UserRecord) => {
    setUserToChangePassword(user);
    setNewPasswordForUser('');
  };

  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userToChangePassword || !newPasswordForUser) {
        toast({ variant: "destructive", title: "Ошибка", description: "Необходимо указать новый пароль."});
        return;
    }
    setAdminLoading(true);
    try {
        const response = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userToChangePassword.id, newPassword: newPasswordForUser }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({message: 'Не удалось изменить пароль'}));
            throw new Error(errorData.message || 'Не удалось изменить пароль');
        }
        toast({ title: "Успех", description: `Пароль для ${userToChangePassword.email} успешно изменен.` });
        setUserToChangePassword(null);
        setNewPasswordForUser('');
        fetchAdminUsers();
    } catch (error: any) {
        console.error("Ошибка изменения пароля:", error);
        toast({ variant: "destructive", title: "Ошибка", description: error.message || "Не удалось изменить пароль." });
    } finally {
        setAdminLoading(false);
    }
  };

  const toggleShowPassword = (userId: string) => {
    setShowPasswordForUser(prev => ({ ...prev, [userId]: !prev[userId] }));
  };


  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    if (event.key.toLowerCase() === 'v') {
      setVKeyPressCount(prevCount => {
        const newCount = prevCount + 1;
        if (newCount >= 5) {
          setIsAdminPanelOpen(true);
          return 0; 
        }
        return newCount;
      });
    } else {
      setVKeyPressCount(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <html lang="ru" className="dark">
      <head>
        <title>PagesMi</title>
        <meta name="description" content="Визуальный конструктор веб-страниц от Firebase Studio" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>

        <Dialog open={isAdminPanelOpen} onOpenChange={setIsAdminPanelOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
                Панель администратора
              </DialogTitle>
              <DialogDescription>
                Управление пользователями. (Функционал ограничен)
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary"/>
                    Управление пользователями
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4 p-4 overflow-hidden">
                  <Card className="p-4 bg-card-foreground/5 flex-shrink-0">
                    <h3 className="text-md font-semibold mb-2 flex items-center"><UserPlus className="h-5 w-5 mr-2 text-primary" />Добавить пользователя</h3>
                    <form onSubmit={handleAddNewUser} className="space-y-3">
                      <div>
                        <Label htmlFor="newUserEmail">Email*</Label>
                        <Input id="newUserEmail" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required className="mt-1 h-9 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="newUserDisplayName">Отображаемое имя</Label>
                        <Input id="newUserDisplayName" type="text" value={newUserDisplayName} onChange={(e) => setNewUserDisplayName(e.target.value)} className="mt-1 h-9 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="newUserPassword">Пароль*</Label>
                        <Input id="newUserPassword" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required className="mt-1 h-9 text-sm" />
                      </div>
                      <Button type="submit" size="sm" disabled={adminLoading} className="w-full">
                        {adminLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        Добавить
                      </Button>
                    </form>
                  </Card>

                  <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-md font-semibold mb-2 mt-3 flex-shrink-0">Существующие пользователи</h3>
                     {adminLoading && adminUsersList.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2">Загрузка пользователей...</p>
                      </div>
                    ) : adminUsersList.length === 0 && !adminLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Пользователи не найдены.</p>
                    ) : (
                      <ScrollArea className="flex-1 pr-3">
                        <div className="space-y-3">
                          {adminUsersList.map((user) => (
                            <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-card-foreground/5">
                              <div className="flex-grow mb-2 sm:mb-0">
                                <p className="text-sm font-medium text-foreground">{user.displayName || user.email || 'Без имени'}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                                <div className="mt-1 flex items-center">
                                  <p className="text-xs text-muted-foreground mr-1">Пароль:</p>
                                  {showPasswordForUser[user.id] ? (
                                    <span className="text-xs text-foreground font-mono">{user.password || "N/A"}</span>
                                  ) : (
                                    <span className="text-xs text-foreground font-mono">••••••••</span>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => toggleShowPassword(user.id)}>
                                    {showPasswordForUser[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                                <p className="text-xs text-destructive mt-0.5">Внимание: Отображение паролей небезопасно!</p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openChangePasswordDialog(user)}
                                  disabled={adminLoading}
                                  className="text-xs"
                                >
                                  <KeyRound className="h-3 w-3 mr-1 sm:mr-1.5" />
                                  <span className="hidden sm:inline">Пароль</span>
                                  <span className="sm:hidden">Пар.</span>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={adminLoading}
                                  className="text-xs"
                                >
                                  <Trash2 className="h-3 w-3 mr-1 sm:mr-1.5" />
                                  Удалить
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Закрыть</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {userToChangePassword && (
            <Dialog open={!!userToChangePassword} onOpenChange={() => setUserToChangePassword(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                           <KeyRound className="h-5 w-5 mr-2 text-primary" /> Изменить пароль для {userToChangePassword.displayName || userToChangePassword.email}
                        </DialogTitle>
                        <DialogDescription>
                            Введите новый пароль для пользователя. Будьте внимательны, это действие нельзя отменить.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="newPasswordInput">Новый пароль*</Label>
                            <Input 
                                id="newPasswordInput" 
                                type="password" 
                                value={newPasswordForUser} 
                                onChange={(e) => setNewPasswordForUser(e.target.value)} 
                                required 
                                className="mt-1 h-9 text-sm"
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setUserToChangePassword(null)}>Отмена</Button>
                            <Button type="submit" disabled={adminLoading}>
                                {adminLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                                Сохранить пароль
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        )}

      </body>
    </html>
  );
}

    
