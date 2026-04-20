'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Lock, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Footer } from '@/components/footer';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');

  const fetchAdminUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      toast({ 
        variant: 'destructive',
        title: 'Ошибка', 
        description: 'Не удалось загрузить список пользователей' 
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUsers([]);
    toast({ title: 'Выход', description: 'Вы вышли из админ-панели' });
  };

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      toast({ 
        variant: 'destructive',
        title: 'Ошибка', 
        description: 'Введите email и пароль' 
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });

      if (response.ok) {
        setNewUsername('');
        setNewPassword('');
        await fetchAdminUsers();
        toast({ title: 'Успех', description: 'Пользователь добавлен' });
      } else {
        const error = await response.json();
        toast({ 
          variant: 'destructive',
          title: 'Ошибка', 
          description: error.error || 'Не удалось добавить пользователя' 
        });
      }
    } catch (err) {
      console.error('Ошибка:', err);
      toast({ 
        variant: 'destructive',
        title: 'Ошибка', 
        description: 'Ошибка при добавлении пользователя' 
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Вы уверены?')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAdminUsers();
        toast({ title: 'Успех', description: 'Пользователь удалён' });
      }
    } catch (err) {
      console.error('Ошибка:', err);
      toast({ 
        variant: 'destructive',
        title: 'Ошибка', 
        description: 'Ошибка при удалении пользователя' 
      });
    }
  };

  const handleUpdatePassword = async (id: string) => {
    if (!editPassword) {
      toast({ 
        variant: 'destructive',
        title: 'Ошибка', 
        description: 'Введите новый пароль' 
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: editPassword })
      });

      if (response.ok) {
        setEditingUserId(null);
        setEditPassword('');
        await fetchAdminUsers();
        toast({ title: 'Успех', description: 'Пароль изменён' });
      }
    } catch (err) {
      console.error('Ошибка:', err);
      toast({ 
        variant: 'destructive',
        title: 'Ошибка', 
        description: 'Ошибка при изменении пароля' 
      });
    }
  };

  // Проверяем есть ли токен при загрузке
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Загружаем пользователей когда пользователь зашёл
  useEffect(() => {
    if (isLoggedIn) {
      fetchAdminUsers();
    }
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (username === 'root' && password === '12345') {
        // Сохраняем токен в localStorage
        localStorage.setItem('adminToken', 'admin_' + Date.now());
        setIsLoggedIn(true);
        setUsername('');
        setPassword('');
        // Загружаем пользователей после входа
        await fetchAdminUsers();
        toast({ title: 'Успех', description: 'Добро пожаловать в админ-панель!' });
      } else {
        setError('Неверные учётные данные');
        toast({ 
          variant: 'destructive',
          title: 'Ошибка', 
          description: 'Неверный логин или пароль' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {!isLoggedIn ? (
        // ФОРМА ВХОДА
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-md"
          >
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-4">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-center text-white">
                  Админ-панель
                </CardTitle>
                <CardDescription className="text-center text-white/60">
                  Введите учётные данные администратора
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/80">
                      Логин
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Введите логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/80">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !username || !password}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-white/40 text-center">
                    Для тестирования используйте:<br />
                    <span className="text-white/60">Логин: root</span><br />
                    <span className="text-white/60">Пароль: 12345</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        // АДМИН-ПАНЕЛЬ
        <div className="relative z-10 max-w-6xl mx-auto min-h-screen flex flex-col">
          <div className="flex justify-between items-center mb-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
                <p className="text-white/60 text-sm">Управление пользователями</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            >
              Выход
            </Button>
          </div>

          <div className="grid gap-6 flex-1">
            {/* Форма добавления пользователя */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Добавить пользователя</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-username" className="text-white/80">
                          Email
                        </Label>
                        <Input
                          id="new-username"
                          type="email"
                          placeholder="Введите email"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-white/80">
                          Пароль
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Введите пароль"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddUser}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white"
                    >
                      Добавить пользователя
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Список пользователей */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Пользователи ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-white/60 text-center py-8">
                      Нет пользователей
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {users.map((user: any) => (
                        <div
                          key={user.id}
                          className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition"
                        >
                          <div>
                            <p className="text-white font-medium">{user.email || user.displayName}</p>
                            <p className="text-white/40 text-sm">ID: {user.id}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            {editingUserId === user.id ? (
                              <>
                                <Input
                                  type="password"
                                  placeholder="Новый пароль"
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  className="w-32 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                                />
                                <Button
                                  onClick={() => handleUpdatePassword(user.id)}
                                  size="sm"
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                >
                                  Сохранить
                                </Button>
                                <Button
                                  onClick={() => setEditingUserId(null)}
                                  size="sm"
                                  variant="outline"
                                  className="border-white/10 text-white/60 hover:text-white"
                                >
                                  Отмена
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  onClick={() => setEditingUserId(user.id)}
                                  size="sm"
                                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                                >
                                  Сменить пароль
                                </Button>
                                <Button
                                  onClick={() => handleDeleteUser(user.id)}
                                  size="sm"
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                >
                                  Удалить
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Footer />
        </div>
      )}
    </div>
  );
}
