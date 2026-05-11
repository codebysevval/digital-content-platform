#!/bin/bash

KIRMIZI='\033[0;31m'
YESIL='\033[0;32m'
SARI='\033[1;33m'
MAVI='\033[0;34m'
SIFIRLA='\033[0m'

PROJE_DIZIN="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIZIN="$PROJE_DIZIN/sochen-backend"
FRONTEND_DIZIN="$PROJE_DIZIN/sochen_frontend"

# nvm ile kurulan node/npm'i bul
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
NPM=$(which npm 2>/dev/null || echo "$NVM_DIR/versions/node/v24.15.0/bin/npm")

echo -e "${MAVI}========================================${SIFIRLA}"
echo -e "${MAVI}       SOCHEN - Proje Başlatılıyor      ${SIFIRLA}"
echo -e "${MAVI}========================================${SIFIRLA}"

# ── 1. VERİTABANI ──────────────────────────────────────────────
echo -e "\n${SARI}[1/3] Veritabanı kontrol ediliyor...${SIFIRLA}"
if pg_isready -h localhost -p 5432 -q; then
    echo -e "${YESIL}  ✓ PostgreSQL zaten çalışıyor (port 5432)${SIFIRLA}"
else
    echo -e "${KIRMIZI}  ✗ PostgreSQL bulunamadı!${SIFIRLA}"
    echo -e "  PostgreSQL'i başlatmak için: sudo systemctl start postgresql"
    echo -e "  Yoksa Docker ile başlatmak için: docker compose -f sochen-backend/docker-compose.yml up -d"
    exit 1
fi

# ── 2. BACKEND ─────────────────────────────────────────────────
echo -e "\n${SARI}[2/3] Backend başlatılıyor (Spring Boot)...${SIFIRLA}"

# Eski process'leri temizle
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "sochen-backend" 2>/dev/null
sleep 1

cd "$BACKEND_DIZIN"

LOG_BACKEND="/tmp/sochen-backend.log"
> "$LOG_BACKEND"  # Log dosyasını sıfırla
./mvnw spring-boot:run > "$LOG_BACKEND" 2>&1 &
BACKEND_PID=$!

echo -n "  Backend yükleniyor"
BEKLEME=0
while ! grep -q "Started SochenApplication" "$LOG_BACKEND" 2>/dev/null; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "\n${KIRMIZI}  ✗ Backend başlatılamadı! Hata için bak: $LOG_BACKEND${SIFIRLA}"
        exit 1
    fi
    sleep 2
    echo -n "."
    BEKLEME=$((BEKLEME + 2))
    if [ $BEKLEME -gt 120 ]; then
        echo -e "\n${KIRMIZI}  ✗ Backend 2 dakikada başlamadı. Hata için bak: $LOG_BACKEND${SIFIRLA}"
        exit 1
    fi
done
echo -e "\n${YESIL}  ✓ Backend hazır → http://localhost:8080${SIFIRLA}"

# ── 3. FRONTEND ────────────────────────────────────────────────
echo -e "\n${SARI}[3/3] Frontend başlatılıyor (React + Vite)...${SIFIRLA}"
cd "$FRONTEND_DIZIN"

LOG_FRONTEND="/tmp/sochen-frontend.log"
pkill -f "vite" 2>/dev/null
sleep 1
> "$LOG_FRONTEND"  # Log dosyasını sıfırla
$NPM run dev > "$LOG_FRONTEND" 2>&1 &
FRONTEND_PID=$!

echo -n "  Frontend yükleniyor"
BEKLEME=0
while ! grep -q "Local:" "$LOG_FRONTEND" 2>/dev/null; do
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "\n${KIRMIZI}  ✗ Frontend başlatılamadı! Hata için bak: $LOG_FRONTEND${SIFIRLA}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
    echo -n "."
    BEKLEME=$((BEKLEME + 1))
    if [ $BEKLEME -gt 30 ]; then
        echo -e "\n${KIRMIZI}  ✗ Frontend 30 saniyede başlamadı. Hata için bak: $LOG_FRONTEND${SIFIRLA}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
done

FRONTEND_URL=$(grep "Local:" "$LOG_FRONTEND" | awk '{print $NF}')
echo -e "\n${YESIL}  ✓ Frontend hazır → ${FRONTEND_URL:-http://localhost:5173}${SIFIRLA}"

# ── ÖZET ───────────────────────────────────────────────────────
echo -e "\n${MAVI}========================================${SIFIRLA}"
echo -e "${YESIL}  Tüm servisler çalışıyor!${SIFIRLA}"
echo -e "  Veritabanı : localhost:5432"
echo -e "  Backend    : http://localhost:8080"
echo -e "  Frontend   : ${FRONTEND_URL:-http://localhost:5173}"
echo -e "${MAVI}========================================${SIFIRLA}"
echo -e "${SARI}  Durdurmak için: Ctrl+C${SIFIRLA}"

# Ctrl+C ile her şeyi temiz kapat
cleanup() {
    echo -e "\n${SARI}Servisler durduruluyor...${SIFIRLA}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${YESIL}Tüm servisler durduruldu.${SIFIRLA}"
    exit 0
}
trap cleanup INT TERM

wait $BACKEND_PID $FRONTEND_PID
