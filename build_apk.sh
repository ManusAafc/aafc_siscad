#!/bin/bash
echo "=============================================="
echo " GERANDO APK DA APLICACAO (Capacitor)"
echo "=============================================="

echo ""
echo "[1/4] Instalando dependencias do Capacitor..."
npm install

echo ""
echo "[2/4] Buildando projeto Vite para producao..."
npm run build

echo ""
echo "[3/4] Sincronizando arquivos Android..."
npx cap sync android

echo ""
echo "=============================================="
echo "TUDO PRONTO!"
echo "Para compilar o APK, abra a pasta 'android' no Android Studio,"
echo "ou execute: cd android && ./gradlew assembleDebug"
echo "=============================================="
