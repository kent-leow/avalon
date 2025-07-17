#!/bin/bash
# Test script to validate lobby functionality

echo "🔍 Validating lobby functionality..."

# Check if key files exist
FILES=(
    "src/app/room/[roomCode]/lobby/RoomLobbyClient.tsx"
    "src/app/room/[roomCode]/lobby/PlayerManagementSection.tsx"
    "src/app/room/[roomCode]/lobby/GameSettingsSection.tsx"
    "src/app/room/[roomCode]/lobby/GameSettingsPanel.tsx"
    "src/app/room/[roomCode]/lobby/StartGameSection.tsx"
)

echo "📁 Checking required files..."
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

# Check TypeScript compilation
echo "🔄 Checking TypeScript compilation..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Check linting
echo "🔍 Checking ESLint..."
npx eslint src/app/room/[roomCode]/lobby/

if [ $? -eq 0 ]; then
    echo "✅ ESLint check passed"
else
    echo "❌ ESLint check failed"
fi

# Test if lobby components are properly exported
echo "🧪 Testing component exports..."
node -e "
const { execSync } = require('child_process');
try {
    const result = execSync('npx tsc --noEmit --target es5 --jsx react --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck --strict src/app/room/[roomCode]/lobby/*.tsx', { encoding: 'utf8' });
    console.log('✅ All lobby components compile successfully');
} catch (error) {
    console.log('❌ Component compilation failed:', error.message);
}
"

echo "📋 Lobby functionality validation complete!"
