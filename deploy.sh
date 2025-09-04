#!/bin/bash

# SmartMob Frontend Deployment Script

echo "🚀 SmartMob Frontend Deployment"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please configure it if needed."
fi

# Build and run
echo "🏗️ Building and starting SmartMob Frontend..."
docker-compose up --build -d

# Check if container is running
if docker-compose ps | grep -q "smartmob-frontend"; then
    echo "✅ SmartMob Frontend is running!"
    echo "🌐 Access the application at: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "   Stop:     docker-compose down"
    echo "   Logs:     docker-compose logs -f smartmob-frontend"
    echo "   Rebuild:  docker-compose up --build -d"
else
    echo "❌ Failed to start the application"
    echo "📋 Check logs with: docker-compose logs smartmob-frontend"
fi
