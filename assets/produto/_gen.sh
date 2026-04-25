#!/usr/bin/env bash
# Gera placeholders WebP/JPG para preview local.
# Execute apenas 1x. Depois substitua pelas fotos reais do produto.
set -e
cd "$(dirname "$0")"

make() {
  local name="$1" w="$2" h="$3" color="$4" label="$5"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${color}:s=${w}x${h},format=rgb24" \
    -vf "drawtext=text='${label}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.35:boxborderw=20" \
    -frames:v 1 "${name}"
}

make hero.webp       1240 1240 '0x8B6F47' 'HERO'
make galeria-1.webp  1200 675  '0x6E5636' 'GALERIA 1'
make galeria-2.webp  800  800  '0x4E3D26' 'GALERIA 2'
make galeria-3.webp  800  800  '0x8B6F47' 'GALERIA 3'
make galeria-4.webp  800  800  '0x6E5636' 'GALERIA 4'
make galeria-5.webp  800  800  '0x4E3D26' 'GALERIA 5'
make og-image.jpg    1200 630  '0x8B6F47' 'COZINHA BONITA · DIA DAS MAES'

echo "✅ Placeholders gerados. Substitua pelas fotos reais do produto."
