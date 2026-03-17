#!/bin/bash
echo "Iniciando Backend na porta 3001..."
cd /var/www/html/onco/backend && npm run start:dev &
BACKEND_PID=$!

echo "Iniciando Frontend na porta 3000..."
cd /var/www/html/onco/frontend && npm run dev &
FRONTEND_PID=$!

echo "Aplicações iniciadas. Pressione Ctrl+C para encerrar."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait
