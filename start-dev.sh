#!/bin/bash

# ConnectSphere Development Startup Script

echo "🚀 Starting ConnectSphere Development Environment"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "📝 Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your Google OAuth credentials"
    echo "   Get them from: https://console.cloud.google.com/"
    echo ""
    read -p "Press Enter after you've configured the .env file..."
fi

# Check if frontend .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating frontend .env.local..."
    cp .env.example .env.local
    echo ""
fi

echo "🎬 Starting servers..."
echo ""
echo "Backend will run on: http://localhost:3000"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend and frontend concurrently
trap 'kill 0' EXIT

cd backend && npm run dev &
BACKEND_PID=$!

sleep 3

npm run dev &
FRONTEND_PID=$!

wait
