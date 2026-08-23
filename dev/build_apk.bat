@echo off
echo ==============================================
echo  GERANDO APK DA APLICACAO (Capacitor)
echo ==============================================

echo.
echo [1/5] Instalando dependencias do Capacitor...
call npm install

echo.
echo [2/5] Buildando projeto Vite para producao...
call npm run build

echo.
echo [3/5] Verificando plataforma Android...
if not exist "android" (
  echo   -^> Adicionando plataforma Android...
  call npx cap add android
) else (
  echo   -^> Plataforma Android ja existe.
)

echo.
echo [4/5] Sincronizando arquivos Android...
call npx cap sync android

echo.
echo ==============================================
echo TUDO PRONTO!
echo Para compilar o APK, abra a pasta "android" no Android Studio,
echo ou execute: cd android ^&^& gradlew assembleDebug
echo.
echo O APK sera gerado em:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo ==============================================
pause
