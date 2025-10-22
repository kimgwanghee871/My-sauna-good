#!/bin/bash

# Auto Deploy Script for Vercel
# Triggers automatic deployment when changes are pushed to specific branches

set -e

echo "🚀 Starting auto-deploy process..."

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if we're on a deployable branch
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "genspark_ai_developer" ]]; then
    echo "✅ Branch $CURRENT_BRANCH is configured for auto-deployment"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo "⚠️  Warning: You have uncommitted changes"
        git status -s
        
        read -p "Do you want to commit and deploy these changes? (y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📝 Committing changes..."
            git add .
            
            # Generate commit message with timestamp
            TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
            COMMIT_MSG="auto-deploy: Updates from $TIMESTAMP"
            
            git commit -m "$COMMIT_MSG"
        else
            echo "❌ Deployment cancelled"
            exit 1
        fi
    fi
    
    echo "🔄 Pushing to origin/$CURRENT_BRANCH..."
    git push origin "$CURRENT_BRANCH"
    
    echo "✅ Push completed! Vercel will automatically deploy."
    echo "🌐 Check deployment status at: https://vercel.com/dashboard"
    
    if [[ "$CURRENT_BRANCH" == "main" ]]; then
        echo "🎯 Production URL: https://my-sauna-good.vercel.app"
    else
        echo "🔍 Preview URL will be available in Vercel dashboard"
    fi
    
else
    echo "❌ Branch $CURRENT_BRANCH is not configured for auto-deployment"
    echo "   Deployable branches: main, genspark_ai_developer"
    exit 1
fi

echo "🎉 Auto-deploy process completed!"