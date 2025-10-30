# API Debugging and Deployment Fix Guide

## Issue
Your Vercel deployment at `https://smart-automation-project-api.vercel.app/` is returning:
```
404: NOT_FOUND
Code: NOT_FOUND
ID: bom1::qnf5m-1760531811794-afe56d989775
```

## Quick Test
Run the debugging script:
```bash
node debug-api.js
```

## Common Vercel Deployment Issues for Monorepos

### 1. Root Directory Configuration
Your project has this structure:
```
/
├── apps/
│   ├── api/          # ← API code here
│   └── web/          # ← Web code here
└── package.json      # ← Root package.json
```

**Fix:** In Vercel dashboard:
- Go to Project Settings → General
- Set **Root Directory** to `apps/api`
- Redeploy

### 2. Build Command Configuration
**In Vercel dashboard:**
- Build Command: `npm run build` (or leave empty if no build needed)
- Output Directory: Leave empty (Express serves from root)
- Install Command: `npm install`

### 3. Environment Variables
Make sure these are set in Vercel:
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-secret
```

### 4. Package.json Check
Your `apps/api/package.json` should have:
```json
{
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "build": "echo 'No build step needed'"
  }
}
```

### 5. Vercel Runtime Configuration
Create `apps/api/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

## Step-by-Step Fix

1. **Run the debug script first:**
   ```bash
   node debug-api.js
   ```

2. **Check Vercel project settings:**
   - Root Directory: `apps/api`
   - Node.js Version: 18.x or 20.x

3. **Add vercel.json configuration**

4. **Redeploy from Vercel dashboard**

5. **Test again with debug script**

## Expected Working Endpoints
- `/` - Should return API info
- `/positions/public` - Should return empty array or position data
- `/planner/rakes/status` - Should return rake status (may need auth)

## If Still Failing
Check Vercel function logs:
1. Go to Vercel Dashboard → Your Project → Functions tab
2. Click on any function to see logs
3. Look for startup errors or import issues