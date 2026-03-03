#!/bin/bash

# SnackEase - Clean Dev-Server Start
# Stoppt alte Prozesse und startet sauberen Dev-Server

echo "🧹 Cleaning up old Nuxt processes..."
pkill -9 -f "nuxt|node.*dev" 2>/dev/null
sleep 1

echo "🔍 Checking if port 3000 is free..."
if lsof -ti:3000 >/dev/null 2>&1; then
  echo "⚠️  Port 3000 still in use, killing process..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  sleep 1
fi

if lsof -ti:3000 >/dev/null 2>&1; then
  echo "❌ Port 3000 could not be freed. Using alternative port."
else
  echo "✅ Port 3000 is free"
fi

echo "🗑️  Cleaning cache (optional, uncomment if needed)..."
# Uncomment next line if you have cache problems:
# rm -rf .nuxt .output node_modules/.vite

echo "🚀 Starting Nuxt Dev Server..."
echo ""
npm run dev
