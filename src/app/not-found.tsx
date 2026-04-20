import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white">
            Страница не найдена
          </h2>
          <p className="text-white/60">
            Похоже, страница, которую вы ищете, не существует или была перемещена.
          </p>
        </div>

        <Link href="/">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
