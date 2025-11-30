
// Содержимое страницы администратора удалено, так как аутентификация отключена.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl font-headline">
             <ShieldAlert className="mr-2 h-6 w-6 text-destructive" />
            Панель администратора
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            Функциональность администратора отключена, так как аутентификация выключена.
          </CardDescription>
           <Button variant="outline" asChild>
            <Link href="/">
              Вернуться на главную
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
