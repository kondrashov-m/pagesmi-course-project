@echo off
chcp 65001 >nul
title PagesMi

echo.
echo  ==========================================
echo       PagesMi  -  zapusk proekta
echo  ==========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo  [!] node_modules ne nayden. Ustanavlivaem zavisimosti...
    echo.
    call npm install
    echo.
)

echo  [1/2] Prisma Studio -^> http://localhost:5555
start "Prisma Studio" cmd /k "cd /d "%~dp0" && npx prisma studio"

timeout /t 2 /nobreak >nul

echo  [2/2] Next.js Dev Server -^> http://localhost:3000
echo.
echo  ------------------------------------------
echo    Prilozhenie  :  http://localhost:3000
echo    Prisma Studio:  http://localhost:5555
echo    Ostanovit    :  Ctrl+C
echo  ------------------------------------------
echo.

call npm run dev

pause
