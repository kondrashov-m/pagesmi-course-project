
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { PenSquare, LogIn } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SiteNav, { SiteFooter } from "@/components/layout/site-nav";

const loginSchema = z.object({
  email: z.string().email("Неверный формат электронной почты."),
  password: z.string().min(6, "Пароль должен содержать не менее 6 символов."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loading: authLoading, user } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    await login(data.email, data.password);
  };

  if (user) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#080C14" }}>
      <p style={{ color: "var(--text-secondary)" }}>Перенаправление...</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "linear-gradient(135deg, #080C14 0%, #0d1526 100%)" }}>
      <SiteNav minimal />
      <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "var(--glass-bg)", border: "1px solid rgba(99,139,255,0.18)", backdropFilter: "blur(20px)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <PenSquare className="h-8 w-8" style={{ color: "#638bff" }} />
            <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>PagesMi</span>
          </Link>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Вход</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Войдите в свою учетную запись PagesMi.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Электронная почта</Label>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="vy@primer.com"
                      className="rounded-lg border"
                      style={{ background: "rgba(15,22,48,0.6)", borderColor: "rgba(99,139,255,0.25)", color: "var(--text-primary)" }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Пароль</Label>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-lg border"
                      style={{ background: "rgba(15,22,48,0.6)", borderColor: "rgba(99,139,255,0.25)", color: "var(--text-primary)" }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all mt-2"
              style={{ background: "linear-gradient(135deg, #3b7fff, #638bff)", color: "#fff", opacity: authLoading ? 0.7 : 1, cursor: authLoading ? "not-allowed" : "pointer" }}
            >
              {authLoading ? "Вход..." : <><LogIn className="h-4 w-4" /> Войти</>}
            </button>
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Нет учетной записи?{" "}
              <Link href="/auth/register" className="font-medium hover:underline" style={{ color: "#638bff" }}>
                Зарегистрируйтесь здесь
              </Link>
            </p>
          </form>
        </Form>
      </div>
      </div>
      <SiteFooter />
    </div>
  );
}
