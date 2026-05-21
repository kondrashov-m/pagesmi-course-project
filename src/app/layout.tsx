"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <head>
        <title>PagesMi</title>
        <meta name="description" content="Визуальный конструктор веб-сайтов" />
        <meta name="darkreader-lock" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Work+Sans:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Figtree:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600;700&family=Karla:wght@300;400;500;600;700&family=Mulish:wght@300;400;600;700&family=Ubuntu:wght@300;400;500;700&family=Josefin+Sans:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&family=EB+Garamond:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Cinzel:wght@400;500;600;700&family=PT+Serif:wght@400;700&family=Pacifico&family=Dancing+Script:wght@400;500;600;700&family=Lobster&family=Caveat:wght@400;500;600;700&family=Comfortaa:wght@300;400;500;600;700&family=Bebas+Neue&family=Abril+Fatface&family=Righteous&family=Source+Code+Pro:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
