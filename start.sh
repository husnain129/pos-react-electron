#!/bin/bash

echo "🚀 Starting Creative Hands POS System..."
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "📦 Installing dependencies..."
bun install

echo ""
echo "🗄️  Starting backend server on port 8001..."
bun run server &
SERVER_PID=$!

# Wait a bit for server to start
sleep 2

echo "🌐 Starting frontend on port 5173..."
bun run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo ""
echo "📍 Access the application at: http://localhost:5173"
echo "📍 API server running at: http://localhost:8001"
echo ""
echo "🔑 Default login credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $SERVER_PID $FRONTEND_PID; exit" INT

wait
