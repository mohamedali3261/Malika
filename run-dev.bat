@echo off
title Malika Dev
call npm run build
start /B npm run dev
start /B npx wrangler dev
pause
