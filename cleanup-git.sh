#!/bin/bash

# Git cleanup script for Sip Grounds
# Removes files that should be ignored from git tracking

echo "🧹 Starting Git cleanup for Sip Grounds..."

# Change to project root
cd "$(dirname "$0")"

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  This is not a git repository. Initializing git..."
    git init
    echo "✅ Git repository initialized"
fi

echo "📁 Removing tracked files that should be ignored..."

# Remove .DS_Store files from tracking
echo "🗑️  Removing .DS_Store files..."
find . -name ".DS_Store" -exec git rm --cached {} \; 2>/dev/null || true

# Remove log files from tracking
echo "🗑️  Removing log files..."
git rm --cached server.log 2>/dev/null || true
git rm --cached sipgrounds-backend/server.log 2>/dev/null || true

# Remove node_modules from tracking (if accidentally tracked)
echo "🗑️  Removing node_modules from tracking..."
git rm -r --cached sipgrounds-backend/node_modules 2>/dev/null || true
git rm -r --cached sipgrounds-frontend/node_modules 2>/dev/null || true

# Remove build directories from tracking
echo "🗑️  Removing build directories..."
git rm -r --cached sipgrounds-frontend/build 2>/dev/null || true

# Remove backup files from tracking
echo "🗑️  Removing backup files..."
git rm --cached sipgrounds-backend/server.js.backup 2>/dev/null || true

echo "✅ Cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add your .gitignore files:"
echo "   git add sipgrounds-backend/.gitignore"
echo "   git add sipgrounds-frontend/.gitignore"
echo ""
echo "2. Commit the changes:"
echo "   git add ."
echo "   git commit -m 'Add .gitignore files and remove ignored files from tracking'"
echo ""
echo "3. The following files will now be ignored in future commits:"
echo "   ✓ node_modules/"
echo "   ✓ .env files"
echo "   ✓ .DS_Store files" 
echo "   ✓ Log files"
echo "   ✓ Build artifacts"
echo "   ✓ IDE files"
echo ""
echo "🎉 Your repository is now properly configured!"
