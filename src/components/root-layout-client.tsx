"use client";

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Trash2, Loader2, UserPlus, KeyRound, Edit, Eye, EyeOff } from "lucide-react";
import type { User as UserRecord } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function RootLayoutClient() {
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
    <>
      <Dialog open={isAdminPanelOpen} onOpenChange={setIsAdminPanelOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" />
              Админ-панель
            </DialogTitle>
            <DialogDescription>Управление пользователями системы</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 border rounded-lg p-4">
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Добавить нового пользователя
                </h3>
                <form onSubmit={handleAddNewUser} className="space-y-3">
                  <div>
                    <Label htmlFor="newUserEmail">Email</Label>
                    <Input
                      id="newUserEmail"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
                      disabled={adminLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newUserDisplayName">Отображаемое имя (опционально)</Label>
                    <Input
                      id="newUserDisplayName"
                      type="text"
                      value={newUserDisplayName}
                      onChange={(e) => setNewUserDisplayName(e.target.value)}
                      placeholder="Имя пользователя"
                      disabled={adminLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newUserPassword">Пароль</Label>
                    <Input
                      id="newUserPassword"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={adminLoading}
                    />
                  </div>
                  <Button type="submit" disabled={adminLoading} className="w-full">
                    {adminLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Добавить пользователя
                  </Button>
                </form>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Список пользователей ({adminUsersList.length})
                </h3>
                {adminLoading && adminUsersList.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : adminUsersList.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Нет пользователей</p>
                ) : (
                  <div className="space-y-2">
                    {adminUsersList.map((user) => (
                      <Card key={user.id} className="p-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <p className="font-medium text-sm break-all">{user.email}</p>
                            {user.displayName && (
                              <p className="text-xs text-muted-foreground">{user.displayName}</p>
                            )}
                            {user.createdAt && (
                              <p className="text-xs text-muted-foreground">
                                Создан: {new Date(user.createdAt).toLocaleString('ru-RU')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openChangePasswordDialog(user)}
                              disabled={adminLoading}
                              title="Изменить пароль"
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={adminLoading}
                              title="Удалить пользователя"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Закрыть</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToChangePassword} onOpenChange={(open) => !open && setUserToChangePassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Изменить пароль
            </DialogTitle>
            <DialogDescription>
              для {userToChangePassword?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Новый пароль</Label>
              <div className="flex gap-2">
                <Input
                  id="newPassword"
                  type={showPasswordForUser[userToChangePassword?.id || ''] ? 'text' : 'password'}
                  value={newPasswordForUser}
                  onChange={(e) => setNewPasswordForUser(e.target.value)}
                  placeholder="••••••••"
                  disabled={adminLoading}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => toggleShowPassword(userToChangePassword?.id || '')}
                >
                  {showPasswordForUser[userToChangePassword?.id || ''] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Отмена
                </Button>
              </DialogClose>
              <Button type="submit" disabled={adminLoading}>
                {adminLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Изменить пароль
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
