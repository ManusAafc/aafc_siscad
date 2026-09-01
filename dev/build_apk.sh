#!/bin/bash
echo "=============================================="
echo " GERANDO APK DA APLICACAO (Capacitor)"
echo "=============================================="

echo ""
echo "[1/4] Buildando projeto Vite para producao..."
npm run build

echo ""
echo "[2/4] Sincronizando arquivos Android..."
npx cap sync android

echo ""
echo "[3/4] Compilando APK..."
cd android && ./gradlew assembleDebug && cd ..

echo ""
echo "[4/4] Copiando APK para a raiz do projeto..."
cp android/app/build/outputs/apk/debug/app-debug.apk ./app-debug.apk

APK_SIZE=$(du -h ./app-debug.apk | cut -f1)
APK_PATH=$(realpath ./app-debug.apk)

echo ""
echo "=============================================="
echo " APK GERADO COM SUCESSO!"
echo "=============================================="
echo ""
echo " Tamanho: $APK_SIZE"
echo " Caminho: $APK_PATH"
echo "=============================================="
