#!/usr/bin/env bash
# Schneidet einen Dennis-Clip aus einem Rohvideo und macht ihn klein und handytauglich.
# Standard ist der Comic-Look (geglättet, weniger Farbstufen, schwarze Konturen).
# Aufruf: tools/clip_schneiden.sh <rohvideo> <start hh:mm:ss> <dauer in s> <ziel.mp4> [comic|natur]
set -euo pipefail

if [ $# -lt 4 ] || [ $# -gt 5 ]; then
  echo "Aufruf: $0 <rohvideo> <start hh:mm:ss> <dauer in s> <ziel.mp4> [comic|natur]" >&2
  exit 1
fi
stil="${5:-comic}"

roh="$1"
start="$2"
dauer="$3"
ziel="$4"

# iPhone-Videos sind oft HDR (HLG, 10 Bit): dann in normale Farben umrechnen
filter="scale='min(640,iw)':-2,fps=30"
if ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of csv=p=0 "$roh" | grep -qE 'arib-std-b67|smpte2084'; then
  filter="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,$filter"
fi
if [ "$stil" = "comic" ]; then
  stufe="trunc(val/28)*28+14"
  filter="$filter,format=rgb24,format=gbrp,bilateral=sigmaS=3:sigmaR=0.08:planes=7,split[farbe][kontur];\
[farbe]eq=contrast=1.25:saturation=1.45:brightness=0.02,format=rgb24,lutrgb=r='$stufe':g='$stufe':b='$stufe',format=gbrp[f];\
[kontur]format=gray,edgedetect=low=0.14:high=0.34,negate,format=gbrp[k];\
[f][k]blend=all_mode=multiply,format=yuv420p"
fi

ffmpeg -hide_banner -loglevel warning -y \
  -ss "$start" -t "$dauer" -i "$roh" \
  -filter_complex "[0:v:0]$filter[v]" -map "[v]" -map 0:a:0? \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:v libx264 -profile:v main -preset slow -crf 26 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 1 -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -movflags +faststart \
  "$ziel"

echo "Fertig: $ziel ($(du -h "$ziel" | cut -f1))"
