#!/bin/bash

echo "🚀 Starting TOTALFISC Development Environment"

# Start API in background
echo "📡 Starting API..."
cd src/TOTALFISC.Api
dotnet run &
API_PID=$!

# Wait for API to be ready
sleep 5

# Start UI
echo "🎨 Starting UI..."
cd ../TotalFisc.UI
pnpm run dev &
UI_PID=$!

echo "✅ Development environment ready!"
echo "API:  http://localhost:5015"
echo "UI:   http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "kill $API_PID $UI_PID" EXIT
wait
