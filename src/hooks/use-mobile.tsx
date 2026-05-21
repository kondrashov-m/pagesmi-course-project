import * as React from "react"

// Редактор требует десктоп — блокируем и по ширине, и по User Agent
const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|Tablet|tablet/i;
const MOBILE_WIDTH = 1024; // px — планшеты тоже не поддерживаются

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  const byUA    = MOBILE_UA.test(navigator.userAgent);
  const byWidth = window.innerWidth < MOBILE_WIDTH;
  return byUA || byWidth;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Первичная проверка после монтирования
    setIsMobile(detectMobile());

    const onResize = () => setIsMobile(detectMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}
