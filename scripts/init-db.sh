#!/bin/bash

# Warte bis Datenbank bereit ist
echo "Warte auf Datenbank..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Datenbank ist bereit!"

# Prisma Schema pushen
echo "Push Prisma Schema..."
npx prisma db push

# Admin-User erstellen (falls nicht vorhanden)
echo "Erstelle Admin-User..."
npx tsx prisma/seed.ts

echo "Datenbank-Initialisierung abgeschlossen!"
