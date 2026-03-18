#!/usr/bin/env powershell
Write-Host "Starting database seed..." -ForegroundColor Green
npx tsx prisma/seed.ts
Write-Host "Seed complete!" -ForegroundColor Green
