#!/bin/bash

# ConnectSphere Installation Script

echo "🎯 ConnectSphere - Installation Script"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if npm install; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend installation failed"
    exit 1
fi
echo ""

# Create backend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "✅ Backend .env created"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your Google OAuth credentials"
    echo "   1. Visit: https://console.cloud.google.com/"
    echo "   2. Create OAuth 2.0 credentials"
    echo "   3. Add to backend/.env file"
    echo ""
else
    echo "✅ Backend .env already exists"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
if npm install; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend installation failed"
    exit 1
fi
echo ""

# Create frontend .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cp .env.example .env.local
    echo "✅ Frontend .env.local created"
else
    echo "✅ Frontend .env.local already exists"
fi

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "Next steps:"
echo "1. Configure Google OAuth credentials in backend/.env"
echo "2. Run './start-dev.sh' to start both servers"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "See QUICKSTART.md for detailed setup instructions"
