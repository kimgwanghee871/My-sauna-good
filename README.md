# G-Won AI Planner

An intelligent planning assistant built with Next.js 15, React, and TypeScript.

## Features
- AI-powered planning and scheduling
- Modern UI with Tailwind CSS
- TypeScript for type safety
- Optimized with Next.js 15 and Turbopack

## Deployment

### Auto Deployment Commands
```bash
# Deploy current branch (main or genspark_ai_developer)
npm run deploy

# Deploy to production (merges genspark_ai_developer to main)  
npm run deploy:production

# Deploy preview (genspark_ai_developer branch)
npm run deploy:preview

# Manual script execution
./scripts/auto-deploy.sh
```

### Deployment Branches
- **Production**: `main` branch → https://my-sauna-good.vercel.app
- **Preview**: `genspark_ai_developer` branch → Preview URL

### Auto Deploy Features
- ✅ Automatic deployment on push to main/genspark_ai_developer
- ✅ Preview deployments for pull requests  
- ✅ Build validation with conflict marker detection
- ✅ GitHub Actions integration
- ✅ Environment variables management

## Development
```bash
npm install
npm run dev
```

## Tech Stack
- Next.js 15.0.2
- React 19 RC
- TypeScript
- Tailwind CSS
- Turbopack# Deployment trigger Thu Oct 16 10:09:42 UTC 2025
# Preview deployment trigger Thu Oct 16 12:15:06 UTC 2025
