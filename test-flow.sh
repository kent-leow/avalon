#!/bin/bash
# Simple test script to verify environment and database connection

echo "=== Avalon Session Debug Test ==="
echo "1. Checking environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

echo "✅ .env file exists"

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "❌ node_modules not found. Please run 'yarn install'"
    exit 1
fi

echo "✅ node_modules exists"

# Check if Prisma is set up
if [ ! -f prisma/schema.prisma ]; then
    echo "❌ Prisma schema not found"
    exit 1
fi

echo "✅ Prisma schema exists"

echo "2. Testing database connection..."
node test-session.js

echo "3. Starting development server..."
echo "Please test the following flows:"
echo "- Create a room and check console logs"
echo "- Join a room and check console logs"
echo "- Check if JWT session is created properly"
echo ""
echo "Starting server in 3 seconds..."
sleep 3

yarn dev
