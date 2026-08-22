@echo off
echo ==============================================
echo  GERANDO APK DA APLICACAO (Capacitor)
echo ==============================================

echo.
echo [1/4] Instalando dependencias do Capacitor...
call npm install

echo.
echo [2/4] Buildando projeto Vite para producao...
call npm run build

echo.
echo [3/4] Adicionando plataforma Android...
call npx cap add android

echo.
echo [4/4] Sincronizando arquivos e gerando build nativo...
call npx cap sync android

echo.
echo ==============================================
echo TUDO PRONTO!
echo Para compilar o APK agora, abra a pasta "android" no Android Studio, 
echo ou tente gerar por linha de comando:
echo cd android ^&^& gradlew assembleDebug
echo ==============================================
pause
