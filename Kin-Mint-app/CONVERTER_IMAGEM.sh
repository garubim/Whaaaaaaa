#!/bin/bash

# Script para converter GIF para WebM
# Reduz tamanho de 16.6MB para ~2-3MB (80% menor)

echo "🎬 Conversor GIF → WebM"
echo "========================"

# Detectar arquivo GIF na pasta metadatapinata
GIF_FILE=$(find metadatapinata -name "*.gif" 2>/dev/null | head -1)

if [ -z "$GIF_FILE" ]; then
  echo "❌ Nenhum arquivo .gif encontrado em metadatapinata/"
  echo "Procurando em todos os diretórios..."
  GIF_FILE=$(find . -name "*.gif" ! -path "./node_modules/*" ! -path "./.next/*" 2>/dev/null | head -1)
  
  if [ -z "$GIF_FILE" ]; then
    echo "❌ Nenhum GIF encontrado no projeto"
    exit 1
  fi
fi

echo "📁 Arquivo encontrado: $GIF_FILE"

# Nome do arquivo de saída
OUTPUT_FILE="${GIF_FILE%.gif}.webm"

echo "⏳ Convertendo (isso pode demorar 5-15 min)..."
echo "   Origem: $GIF_FILE"
echo "   Destino: $OUTPUT_FILE"
echo ""

# Comando ffmpeg com quality otimizada
ffmpeg -i "$GIF_FILE" \
  -c:v libvpx-vp9 \
  -b:v 0 \
  -crf 30 \
  -quality good \
  -cpu-used 4 \
  "$OUTPUT_FILE"

if [ -f "$OUTPUT_FILE" ]; then
  ORIG_SIZE=$(ls -lh "$GIF_FILE" | awk '{print $5}')
  NEW_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
  echo ""
  echo "✅ Conversão concluída!"
  echo "📊 Tamanho original: $ORIG_SIZE"
  echo "📊 Tamanho novo: $NEW_SIZE"
  echo ""
  echo "⚠️  PRÓXIMOS PASSOS:"
  echo "1. Fazer upload de $OUTPUT_FILE para Pinata"
  echo "2. Atualizar metadata em metadatapinata/1.json:"
  echo '   "image": "ipfs://[novo-CID]/[arquivo].webm"'
else
  echo "❌ Erro na conversão"
  exit 1
fi
